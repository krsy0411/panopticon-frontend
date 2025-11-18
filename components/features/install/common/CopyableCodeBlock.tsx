// 코드 블록 + 복사 버튼

'use client';

import { useState } from 'react';
import { FiCheck, FiCopy } from 'react-icons/fi';

interface CopyableCodeBlockProps {
  code: string;
  className?: string;
  copyLabel?: string;
  language?: string;
}

export function CopyableCodeBlock({
  code,
  className = '',
  copyLabel = '복사',
}: CopyableCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!navigator?.clipboard) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      console.error('Copy failed', error);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-100 p-3 sm:p-4">
      {/* 복사 버튼 영역 */}
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

      {/* 코드 컨테이너 */}
      <div className={`mt-3 overflow-x-auto bg-gray-100 rounded-lg ${className}`}>
        <pre className="p-4 sm:p-6 text-xs sm:text-sm text-gray-900 bg-inherit rounded-lg">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
