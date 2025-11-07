'use client';

import { useState } from 'react';
import { FiCheck, FiCopy } from 'react-icons/fi';

interface CopyableCodeBlockProps {
  code: string;
  className?: string;
  copyLabel?: string;
}

export function CopyableCodeBlock({ code, className = '', copyLabel = '복사' }: CopyableCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!navigator?.clipboard) {
      return;
    }
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error('Copy failed', error);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-gray-400"
        >
          {copied ? <FiCheck className="h-4 w-4" /> : <FiCopy className="h-4 w-4" />}
          {copied ? '복사완료' : copyLabel}
        </button>
      </div>
      <div className={`mt-3 overflow-x-auto ${className}`}>
        <pre className="rounded-lg bg-gray-100 p-4 text-xs text-gray-900 sm:p-6 sm:text-sm">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
