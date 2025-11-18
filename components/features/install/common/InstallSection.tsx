'use client';

import { CopyableCodeBlock } from './CopyableCodeBlock';

type InstallSectionProps = {
  heading?: string;
  description?: string;
  meta?: string;
  code: string;
  language?: string;
};

export function InstallSection({
  heading,
  description,
  meta,
  code,
  language,
}: InstallSectionProps) {
  return (
    <div>
      {heading && <h3 className="text-xl font-bold text-gray-900 mb-1">{heading}</h3>}

      {/* 섹션-level meta (3-1 / 3-2의 작업 유형) */}
      {meta && <p className="text-sm font-semibold text-gray-500 mb-1">{meta}</p>}

      {description && (
        <p className="text-sm text-gray-600 mb-3 whitespace-pre-line">{description}</p>
      )}

      <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-5">
        <CopyableCodeBlock code={code} language={language} />
      </div>
    </div>
  );
}
