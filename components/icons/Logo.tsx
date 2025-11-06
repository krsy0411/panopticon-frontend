// Panopticon 임시 로고

import Activity from '@/components/icons/landing/Activity';

interface LogoProps {
  textSize?: string;
  iconSize?: string;
  showText?: boolean;
  className?: string;
}

export default function Logo({
  textSize = 'text-xl',
  iconSize = 'w-8 h-8',
  showText = true,
  className = '',
}: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* 아이콘 배경 */}
      <div
        className={`${iconSize} bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center`}
      >
        <Activity className="w-5 h-5 text-white" />
      </div>

      {/* 서비스명 텍스트 */}
      {showText && <span className={`${textSize} font-semibold`}>Panopticon</span>}
    </div>
  );
}
