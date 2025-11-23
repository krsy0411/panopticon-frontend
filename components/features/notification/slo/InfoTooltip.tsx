interface InfoTooltipProps {
  title: string;
  description: string;
}

export function InfoTooltip({ title, description }: InfoTooltipProps) {
  return (
    <div className="relative group inline-flex items-center cursor-help">
      {/* Info 아이콘 */}
      <svg
        className="
          w-4 h-4 text-gray-400
          transition-all duration-200
          group-hover:text-blue-600
          group-hover:scale-110
        "
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-4a1 1 0 100 2 1 1 0 000-2zm-1 4a1 1 0 100 2v2a1 1 0 102 0v-2a1 1 0 10-2 0z"
          clipRule="evenodd"
        />
      </svg>

      {/* Tooltip */}
      <div
        className="
          pointer-events-none
          absolute top-7 left-1/2 -translate-x-1/2
          z-30 w-64

          opacity-0 scale-95
          group-hover:opacity-100 group-hover:scale-100
          transition-all duration-200 ease-out

          bg-white/80 backdrop-blur-md
          border border-gray-200 shadow-xl
          rounded-xl p-4
        "
      >
        {/* 화살표 */}
        <div
          className="
            absolute -top-2 left-1/2 -translate-x-1/2
            w-0 h-0
            border-l-8 border-r-8 border-b-8
            border-l-transparent border-r-transparent border-b-gray-200
          "
        ></div>

        <div className="text-xs font-semibold text-gray-900 mb-1">{title}</div>
        <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
