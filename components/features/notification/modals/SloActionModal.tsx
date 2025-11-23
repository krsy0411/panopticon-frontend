// SLO 삭제/수정 시 뜨는 확인 모달

import type { ComputedSlo } from '@/src/types/notification';

interface SloActionModalProps {
  type: 'delete' | 'edit';
  open: boolean;
  slo?: ComputedSlo | null;
  onConfirm: (slo: ComputedSlo) => void;
  onClose: () => void;
}

export function SloActionModal({ type, open, slo, onConfirm, onClose }: SloActionModalProps) {
  if (!open || !slo) return null;

  const isDelete = type === 'delete';
  const title = isDelete ? 'SLO 삭제' : 'SLO 수정';
  const description = isDelete
    ? `이 SLO는 ${slo.connectedChannels.length}개 채널에 연결되어 있습니다. 삭제하면 해당 알림이 비활성화됩니다. 정말 삭제하시겠습니까?`
    : '목표값을 변경하면 허용치 계산 방식이 바뀝니다. 변경하시겠습니까?';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-xl">{isDelete ? '⚠️' : '✏️'}</span>
          <div className="text-lg font-semibold text-gray-900">{title}</div>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
          <div className="font-semibold text-gray-900 mb-1">{slo.name}</div>
          <p className="leading-relaxed">{description}</p>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => onConfirm(slo)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
              isDelete ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isDelete ? '삭제' : '변경'}
          </button>
        </div>
      </div>
    </div>
  );
}
