'use client';

import { useMemo } from 'react';
import type { LogEntry } from '@/types/apm';

interface LogGroup {
  key: string;
  title: string;
  items: LogEntry[];
}

interface ExtendedGroup extends LogGroup {
  primaryLevel: string;
  primaryPriority: number;
}

interface Props {
  items: LogEntry[];
  maxGroups?: number;
  // 페이지 관련: page와 pageSize가 주어지면 해당 페이지만 표시
  page?: number;
  pageSize?: number;
  // 그룹 클릭 시 호출 (그룹 key, 대표 메시지, 그룹에 포함된 항목)
  onGroupClick?: (key: string, title: string, items: LogEntry[]) => void;
}

// Traceback에서 Exception 타입 추출
function extractExceptionType(msg: string): string | null {
  const match = msg.match(/(\w+(?:Error|Timeout|Exception))\s*(?::|\n|$)/i);
  return match?.[1] || null;
}

// 원본 메시지에서 콜론 앞 부분을 추출하여 title 생성
// 예: "Full request data: {...}" -> "Full request data:"
function extractTitleFromMessage(message: string): string {
  // Traceback인 경우 특별 처리
  if (message.includes('Traceback') || message.includes('File "')) {
    const exceptionType = extractExceptionType(message);
    if (exceptionType) {
      return `[Traceback] ${exceptionType}`;
    }
    return '[Traceback] Unknown Exception';
  }

  // 일반 메시지: 콜론 앞부분 추출
  const beforeColon = message.split(':')[0].trim();
  return beforeColon || message.substring(0, 100);
}

// 간단한 메시지 정규화: 소문자, 숫자/헥스/특수문자 제거, 공백 축약, 길이 제한
function normalizeMessage(msg: string): string {
  // Traceback인 경우 Exception 타입으로 정규화
  if (msg.includes('Traceback') || msg.includes('File "')) {
    const exceptionType = extractExceptionType(msg);
    if (exceptionType) {
      return `traceback ${exceptionType}`.toLowerCase();
    }
  }

  // 콜론(:)이 있으면 콜론 앞부분만 추출 (e.g., "Full request data: {...}" -> "Full request data")
  // 이를 통해 내용만 다른 같은 종류의 로그들을 함께 그룹화
  const beforeColon = msg.split(':')[0].trim();

  // 콜론 앞부분이 있으면 그것을 기준으로 정규화
  const baseMessage = beforeColon || msg;

  return baseMessage
    .toLowerCase()
    .replace(/0x[a-f0-9]+/gi, ' ') // hex
    .replace(/\d+/g, ' ') // numbers
    .replace(/[^a-z0-9\s]/gi, ' ') // punct
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

// 그룹 계산 유틸: 전체 그룹(정렬 포함)을 반환
export function computeGroups(items: LogEntry[]): ExtendedGroup[] {
  const map = new Map<string, LogEntry[]>();

  for (const it of items) {
    const key = normalizeMessage(it.message || '') || 'other';
    const arr = map.get(key) || [];
    arr.push(it);
    map.set(key, arr);
  }

  const levelPriority = (lvl?: string) => {
    if (!lvl) return 99;
    const L = lvl.toUpperCase();
    if (L === 'ERROR') return 0;
    if (L === 'WARN' || L === 'WARNING') return 1;
    if (L === 'DEBUG') return 2;
    if (L === 'INFO') return 3;
    return 99;
  };

  const arr: ExtendedGroup[] = Array.from(map.entries()).map(([k, v]) => {
    const primary = v.reduce((best: string | null, it) => {
      if (!best) return it.level || null;
      return levelPriority(it.level) < levelPriority(best) ? it.level : best;
    }, null as string | null);

    // 그룹의 첫 번째 메시지에서 title 추출 (원본 메시지 기반)
    const title = extractTitleFromMessage(v[0]?.message || k);

    return {
      key: k,
      title,
      items: v,
      primaryLevel: primary || 'INFO',
      primaryPriority: levelPriority(primary || 'INFO'),
    };
  });

  arr.sort((a: ExtendedGroup, b: ExtendedGroup) => {
    // 1차: 로그 레벨 우선순위
    if (a.primaryPriority !== b.primaryPriority) return a.primaryPriority - b.primaryPriority;
    // 2차: 메시지 발생 횟수 (많을수록 먼저)
    return b.items.length - a.items.length;
  });

  return arr;
}

export default function LogGroups({ items, maxGroups = 20, page, pageSize, onGroupClick }: Props) {
  const fullGroups = useMemo(() => computeGroups(items), [items]);
  const totalGroups = fullGroups.length;

  // 페이징이 주어지면 해당 페이지만 표시, 아니면 maxGroups 기준으로 자름
  const groups = useMemo<ExtendedGroup[]>(() => {
    if (typeof page === 'number' && typeof pageSize === 'number') {
      const start = Math.max(0, (page - 1) * pageSize);
      return fullGroups.slice(start, start + pageSize);
    }
    return fullGroups.slice(0, maxGroups);
  }, [fullGroups, page, pageSize, maxGroups]);

  if (!items || items.length === 0)
    return <div className="text-sm text-gray-500">로그가 없습니다</div>;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold mb-1">로그 그룹 (유사 메시지)</h3>
      <div className="text-xs text-gray-500">
        그룹 <strong>{totalGroups}</strong>개 중 <strong>{groups.length}</strong>개 표시
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {groups.map((g) => (
          <div
            key={g.key}
            role="button"
            onClick={() => onGroupClick && onGroupClick(g.key, g.title, g.items)}
            // 왼쪽 테두리 색상을 레벨에 따라 변경
            className={`border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer bg-white border-l-4 h-40 flex flex-col ${
              g.primaryLevel === 'ERROR'
                ? 'border-l-red-500'
                : g.primaryLevel === 'WARN' || g.primaryLevel === 'WARNING'
                ? 'border-l-amber-500'
                : g.primaryLevel === 'DEBUG'
                ? 'border-l-gray-300'
                : g.primaryLevel === 'INFO'
                ? 'border-l-blue-200'
                : 'border-l-gray-200'
            }`}
          >
            <div className="flex flex-col items-start justify-between h-full">
              <div className="flex-1 overflow-hidden">
                <div className="text-sm font-medium text-gray-800 wrap-break-word line-clamp-3">
                  {g.title}
                </div>
                <div className="flex gap-2 mt-2">
                  <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 shrink-0">
                    {g.primaryLevel}
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-3">{g.items.length}개 메시지</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
