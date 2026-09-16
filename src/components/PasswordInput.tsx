"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  id?: string;
  name?: string;
  required?: boolean;
  placeholder?: string;
  minLength?: number;
  className?: string;
}

export function PasswordInput({
  id = "password",
  name = "password",
  required = true,
  placeholder = "••••••••",
  minLength,
  className = "",
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <input
        id={id}
        name={name}
        type={showPassword ? "text" : "password"}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        className={`w-full rounded-2xl border border-brand/20 px-4 py-2.5 pr-11 text-sm ${className}`}
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        aria-label={showPassword ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand/50 hover:text-brand transition p-1"
      >
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
