import IconWrapper from '../IconWrapper';

export default function BarChart3(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper>
      <svg
        viewBox="0 0 24 24"
        width={props.width || 20}
        height={props.height || 20}
        className={props.className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3v18h18" />
        <rect x="7" y="8" width="3" height="8" />
        <rect x="12" y="5" width="3" height="11" />
        <rect x="17" y="10" width="3" height="6" />
      </svg>
    </IconWrapper>
  );
}
