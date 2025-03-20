CREATE TABLE IF NOT EXISTS work_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  project_code text NOT NULL,
  client_name text NOT NULL,
  contact_person text,
  description text NOT NULL,
  duration numeric NOT NULL,
  is_completed boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Row Level Security (RLS) politikaları
ALTER TABLE work_logs ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar sadece kendi kayıtlarını görebilir
CREATE POLICY "Kullanıcılar kendi iş kayıtlarını görebilir" ON work_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Kullanıcılar sadece kendi kayıtlarını ekleyebilir
CREATE POLICY "Kullanıcılar kendi iş kayıtlarını ekleyebilir" ON work_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar sadece kendi kayıtlarını güncelleyebilir
CREATE POLICY "Kullanıcılar kendi iş kayıtlarını güncelleyebilir" ON work_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Kullanıcılar sadece kendi kayıtlarını silebilir
CREATE POLICY "Kullanıcılar kendi iş kayıtlarını silebilir" ON work_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Eksik iş günlerini kontrol etme fonksiyonu
CREATE OR REPLACE FUNCTION public.check_missing_workdays(p_user_id uuid, p_start_date date, p_end_date date)
RETURNS TABLE (missing_date date) AS $$
DECLARE
  current_date date := p_start_date;
BEGIN
  WHILE current_date <= p_end_date LOOP
    -- Hafta içi günleri kontrol et (1-5 = Pazartesi-Cuma)
    IF EXTRACT(DOW FROM current_date) BETWEEN 1 AND 5 THEN
      -- Bu tarihte kayıt var mı kontrol et
      IF NOT EXISTS (
        SELECT 1 FROM work_logs 
        WHERE user_id = p_user_id AND date = current_date
      ) THEN
        missing_date := current_date;
        RETURN NEXT;
      END IF;
    END IF;
    
    current_date := current_date + INTERVAL '1 day';
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Aylık çalışma süresini hesaplama fonksiyonu
CREATE OR REPLACE FUNCTION public.calculate_monthly_work(p_user_id uuid, p_year int, p_month int)
RETURNS TABLE (
  total_days int,
  completed_days int,
  total_duration numeric,
  completion_percentage numeric
) AS $$
DECLARE
  start_date date := make_date(p_year, p_month, 1);
  end_date date := (make_date(p_year, p_month, 1) + interval '1 month' - interval '1 day')::date;
  work_days int := 0;
  completed int := 0;
  total numeric := 0.0;
BEGIN
  -- İş günlerini hesapla (Pazartesi-Cuma)
  SELECT COUNT(*)
  INTO work_days
  FROM generate_series(start_date, end_date, interval '1 day') AS d
  WHERE EXTRACT(DOW FROM d) BETWEEN 1 AND 5;
  
  -- Tamamlanan günler ve toplam süre
  SELECT COUNT(DISTINCT date), COALESCE(SUM(duration), 0)
  INTO completed, total
  FROM work_logs
  WHERE user_id = p_user_id
    AND date BETWEEN start_date AND end_date;
  
  total_days := work_days;
  completed_days := completed;
  total_duration := total;
  completion_percentage := CASE WHEN work_days > 0 THEN (completed::numeric / work_days) * 100 ELSE 0 END;
  
  RETURN NEXT;
  RETURN;
END;
$$ LANGUAGE plpgsql; 