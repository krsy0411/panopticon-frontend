import IconWrapper from '../IconWrapper';

export default function Zap(props: React.SVGProps<SVGSVGElement>) {
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
        <path d="M13 2 3 14h7l-1 8 10-12h-7z" />
      </svg>
    </IconWrapper>
  );
}
