'use client';

import { useState } from 'react';
import { HiPlus, HiPencil } from 'react-icons/hi2';

interface AppFormProps {
  onCreate?: (name: string, description?: string) => Promise<void> | void;
  onClose?: () => void;
  initialName?: string;
  initialDescription?: string;
}

export function AppForm({
  onCreate,
  onClose,
  initialName = '',
  initialDescription = '',
}: AppFormProps) {
  const [name, setName] = useState(() => initialName);
  const [description, setDescription] = useState(() => initialDescription || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!initialName;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);

    if (onCreate) {
      await onCreate(name, description);
    }

    setName('');
    setDescription('');
    setIsSubmitting(false);

    if (onClose) {
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          앱 이름 <span className="text-red-500">*</span>
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예) Bank"
          required
          autoFocus
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          설명 <span className="text-slate-400 text-xs">(선택사항)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="예) 뱅크 주요 서비스 그룹"
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isEditMode ? <HiPencil className="h-4 w-4" /> : <HiPlus className="h-4 w-4" />}
          {isSubmitting ? (isEditMode ? '수정 중...' : '생성 중...') : isEditMode ? '수정' : '생성'}
        </button>
      </div>
    </form>
  );
}
