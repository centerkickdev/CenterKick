"use client";

import { useState, ReactNode } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

interface PasswordFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  rightElement?: ReactNode;
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showRequirements?: boolean;
  confirmFor?: string;
}

export function PasswordField({
  name,
  label,
  placeholder = "••••••••",
  required = true,
  rightElement,
  defaultValue,
  value,
  onChange,
  showRequirements = false,
  confirmFor
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue || "");

  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (value === undefined) {
      setInternalValue(e.target.value);
    }
    if (onChange) {
      onChange(e);
    }
  };

  const requirements = [
    { label: "Min 8 characters", met: currentValue.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(currentValue) },
    { label: "Number", met: /[0-9]/.test(currentValue) },
    { label: "Special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(currentValue) },
  ];

  const passwordsMatch = confirmFor !== undefined && currentValue === confirmFor;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <label className="text-xs font-bold text-gray-900 tracking-wide ml-1">{label}</label>
        {rightElement}
      </div>
      <div className="relative">
        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
        <input
          name={name}
          type={showPassword ? "text" : "password"}
          required={required}
          placeholder={placeholder}
          value={value}
          defaultValue={value === undefined ? defaultValue : undefined}
          onChange={handleChange}
          className="w-full bg-gray-50 border-none rounded-2xl pl-14 pr-14 py-3 text-sm font-bold focus:ring-2 focus:ring-[#a20000] focus:bg-white transition-all outline-none text-black placeholder:text-gray-900"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {showRequirements && (
        <div className="grid grid-cols-2 gap-2 mt-2 px-2">
          {requirements.map((req, i) => (
            <div key={i} className={`flex items-center gap-1.5 text-xs font-bold tracking-wide transition-colors ${req.met ? 'text-green-600' : 'text-gray-400'}`}>
              {req.met ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              {req.label}
            </div>
          ))}
        </div>
      )}

      {confirmFor !== undefined && currentValue.length > 0 && (
        <div className={`mt-2 px-2 flex items-center gap-1.5 text-xs font-bold tracking-wide transition-colors ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
          {passwordsMatch ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          {passwordsMatch ? "Passwords match" : "Passwords do not match"}
        </div>
      )}
    </div>
  );
}
