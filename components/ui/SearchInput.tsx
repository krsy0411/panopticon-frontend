'use client';

import React from 'react';
import { FiSearch } from 'react-icons/fi';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search',
  className,
  ...props
}: SearchInputProps) {
  return (
    <div
      className={`flex items-center gap-2 border border-input rounded-md px-3 py-1 bg-input-background focus-within:ring-2 focus-within:ring-ring/50 transition ${className}`}
    >
      <FiSearch className="w-4 h-4 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
        {...props}
      />
    </div>
  );
}
