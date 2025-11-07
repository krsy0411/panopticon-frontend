import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
interface PaginationProps {
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function Pagination({ page, totalPages, onPrev, onNext }: PaginationProps) {
  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      <button
        onClick={onPrev}
        disabled={page === 1}
        className={`w-8 h-8 flex items-center justify-center rounded-full text-lg transition-colors border-none
          ${
            page === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border hover:border-blue-500'
          }
        `}
        aria-label="이전 페이지"
      >
        <FiChevronLeft />
      </button>

      <span className="text-sm text-gray-700">
        {page} / {totalPages}
      </span>

      <button
        onClick={onNext}
        disabled={page === totalPages}
        className={`w-8 h-8 flex items-center justify-center rounded-full text-lg transition-colors border-none
          ${
            page === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border hover:border-blue-500'
          }
        `}
        aria-label="다음 페이지"
      >
        <FiChevronRight />
      </button>
    </div>
  );
}
