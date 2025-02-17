-- Create images bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- Allow public access to images
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'images' );

-- Allow authenticated users to upload images
create policy "Authenticated users can upload images"
on storage.objects for insert
with check (
  bucket_id = 'images'
  and auth.role() = 'authenticated'
);

-- Allow authenticated users to update their own images
create policy "Users can update own images"
on storage.objects for update
using (
  bucket_id = 'images'
  and auth.uid() = owner
)
with check (
  bucket_id = 'images'
  and auth.uid() = owner
);

-- Allow authenticated users to delete their own images
create policy "Users can delete own images"
on storage.objects for delete
using (
  bucket_id = 'images'
  and auth.uid() = owner
); 