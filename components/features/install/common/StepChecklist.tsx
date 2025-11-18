// “설정 확인” 같은 체크리스트 UI

'use client';

type StepChecklistProps = {
  title: string;
  items: string[];
};

export function StepChecklist({ title, items }: StepChecklistProps) {
  return (
    <div className="mt-10 rounded-xl border border-green-200 bg-green-50 p-6">
      <h3 className="text-lg font-semibold text-green-900">{title}</h3>
      <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm text-green-800">
        {items.map((item) => (
          <li key={item} className="whitespace-pre-line">
            {item}
          </li>
        ))}
      </ol>
    </div>
  );
}
