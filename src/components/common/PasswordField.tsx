"use client";

import { useState, ReactNode } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  rightElement?: ReactNode;
  defaultValue?: string;
}

export function PasswordField({ 
  name, 
  label, 
  placeholder = "••••••••", 
  required = true, 
  rightElement,
  defaultValue
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-black text-gray-900 tracking-wide ml-1">{label}</label>
        {rightElement}
      </div>
      <div className="relative">
        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
        <input 
          name={name}
          type={showPassword ? "text" : "password"} 
          required={required}
          placeholder={placeholder} 
          defaultValue={defaultValue}
          className="w-full bg-gray-50 border-none rounded-2xl pl-14 pr-14 py-5 text-base font-bold focus:ring-2 focus:ring-[#a20000] focus:bg-white transition-all outline-none text-black placeholder:text-gray-900" 
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
