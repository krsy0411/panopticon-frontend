import IconWrapper from '../IconWrapper';

interface FrontendIconProps {
  size?: number;
  color?: string;
}

export default function FrontendIcon({ size = 20, color = 'currentColor' }: FrontendIconProps) {
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
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
      </svg>
    </IconWrapper>
  );
}
