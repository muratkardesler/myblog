import { Dispatch, SetStateAction, ChangeEvent } from 'react';

interface AuthInputProps {
  type: string;
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required: boolean;
  error?: string;
  isPassword?: boolean;
  showPassword?: boolean;
  setShowPassword?: Dispatch<SetStateAction<boolean>>;
  icon?: string;
}

export default function AuthInput({
  type,
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  isPassword,
  showPassword,
  setShowPassword,
  icon
}: AuthInputProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-gray-200">
        {label}
      </label>
      <div className="relative rounded-lg">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className={`${icon} text-gray-400`}></i>
          </div>
        )}
        <input
          type={isPassword && showPassword ? 'text' : type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          autoComplete={isPassword ? "current-password" : "on"}
          required={required}
          placeholder={placeholder}
          className={`block w-full bg-gray-800/50 border ${
            error ? 'border-red-500/70' : 'border-gray-600/50'
          } rounded-lg py-2.5 pr-10 ${icon ? 'pl-10' : 'pl-3'} text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
          data-1p-ignore={isPassword ? false : true}
        />
        
        {isPassword && setShowPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
          >
            {showPassword ? (
              <i className="ri-eye-off-line text-lg" aria-hidden="true"></i>
            ) : (
              <i className="ri-eye-line text-lg" aria-hidden="true"></i>
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
} 