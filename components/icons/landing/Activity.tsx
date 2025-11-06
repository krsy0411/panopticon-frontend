import IconWrapper from '../IconWrapper';

export default function Activity(props: React.SVGProps<SVGSVGElement>) {
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
        <path d="M22 12h-4l-3 7-6-14-3 7H2" />
      </svg>
    </IconWrapper>
  );
}
