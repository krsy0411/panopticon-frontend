import IconWrapper from '../IconWrapper';

export default function ArrowRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <IconWrapper>
      <svg
        viewBox="0 0 24 24"
        width={props.width || 16}
        height={props.height || 16}
        className={props.className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </IconWrapper>
  );
}
