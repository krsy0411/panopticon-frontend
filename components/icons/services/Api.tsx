import IconWrapper from '../IconWrapper';

interface ApiIconProps {
  size?: number;
  color?: string;
}

export default function ApiIcon({ size = 20, color = 'currentColor' }: ApiIconProps) {
  return (
    <IconWrapper>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* 본체 */}
        <rect x="5" y="6" width="14" height="12" rx="2" />
        {/* 상단 네트워크/안테나 */}
        <line x1="12" y1="2" x2="12" y2="6" />
        {/* 하단 포트 */}
        <circle cx="8.5" cy="18.5" r="1" />
        <circle cx="15.5" cy="18.5" r="1" />
      </svg>
    </IconWrapper>
  );
}
