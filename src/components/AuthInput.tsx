import { useState } from 'react';

interface AuthInputProps {
  type: string;
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  icon?: string;
  error?: string;
  isPassword?: boolean;
}

export default function AuthInput({
  type,
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  icon,
  error,
  isPassword = false,
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <i className={`${icon} text-gray-400`}></i>
          </div>
        )}
        <input
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full px-4 ${
            icon ? 'pl-10' : ''
          } py-2 bg-gray-800 border ${
            error ? 'border-red-500' : 'border-gray-700'
          } rounded-xl text-gray-100 focus:outline-none focus:border-primary`}
          placeholder={placeholder}
          required={required}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => setShowPassword(!showPassword)}
          >
            <i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-gray-400`}></i>
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
} 