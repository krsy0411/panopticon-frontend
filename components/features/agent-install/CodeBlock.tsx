'use client';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code }: CodeBlockProps) {
  return (
    <div className="bg-gray-900 text-gray-100 p-4 overflow-x-auto rounded-b-lg">
      <pre className="text-sm font-mono whitespace-pre-wrap wrap-break-word">{code}</pre>
    </div>
  );
}
