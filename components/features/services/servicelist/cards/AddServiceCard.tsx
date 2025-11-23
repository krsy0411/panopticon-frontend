// 서비스 추가 카드

'use client';

import { FiPlus } from 'react-icons/fi';

interface AddServiceCardProps {
  onClick?: () => void;
}

export default function AddServiceCard({ onClick }: AddServiceCardProps) {
  const isDisabled = typeof onClick !== 'function';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={`
    w-full
    rounded-2xl border-2 border-dashed border-gray-300
    bg-white
    p-5
    flex flex-col items-center justify-center
    text-gray-500
    transition
    hover:-translate-y-1 hover:shadow-md
    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    h-full
    min-h-[160px]   /* 서비스 카드와 동일한 높이 확보 */
  `}
    >
      <div className="flex flex-col items-center gap-2 text-sm font-medium">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300">
          <FiPlus className="h-6 w-6" />
        </span>
        <span>Add service</span>
      </div>
    </button>
  );
}
