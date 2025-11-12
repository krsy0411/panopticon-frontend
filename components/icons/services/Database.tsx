import IconWrapper from '../IconWrapper';

interface DatabaseIconProps {
  size?: number;
  color?: string;
}

export default function DatabaseIcon({ size = 20, color = 'currentColor' }: DatabaseIconProps) {
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
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5v14a9 3 0 0 0 18 0V5" />
        <path d="M3 12a9 3 0 0 0 18 0" />
      </svg>
    </IconWrapper>
  );
}
