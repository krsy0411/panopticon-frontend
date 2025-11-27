'use client';

import { useMemo, useState } from 'react';
import Pagination from '../../Pagination';
import { useQuery } from '@tanstack/react-query';
import { getLogs } from '@/src/api/apm';
import { LogLevel, LogEntry } from '@/types/apm';
import { useTimeRangeStore } from '@/src/store/timeRangeStore';
import StateHandler from '@/components/ui/StateHandler';
import LogGroups, { computeGroups } from '@/components/common/LogGroups';
import LogGroupPanel from '@/components/common/LogGroupPanel';
import TagSearchBar from '@/components/ui/TagSearchBar';
import type { Tag } from '@/types/tagSearchBar';

interface LogsSectionProps {
  serviceName: string;
}

// Traceback에서 Exception 타입 추출
function extractExceptionType(msg: string): string | null {
  // 마지막 예외 라인 찾기 (예: "httpcore.ConnectTimeout: ...")
  const match = msg.match(/(\w+(?:Error|Timeout|Exception))\s*(?::|\n|$)/i);
  return match?.[1] || null;
}

// 간단한 메시지 정규화(그룹화 기준과 동일하게 유지)
function normalizeMessage(msg: string): string {
  // Traceback인 경우 Exception 타입으로 정규화
  if (msg.includes('Traceback') || msg.includes('File "')) {
    const exceptionType = extractExceptionType(msg);
    if (exceptionType) {
      return `traceback ${exceptionType}`.toLowerCase();
    }
  }

  // 콜론(:)이 있으면 콜론 앞부분만 추출
  const beforeColon = msg.split(':')[0].trim();
  const baseMessage = beforeColon || msg;

  return baseMessage
    .toLowerCase()
    .replace(/0x[a-f0-9]+/gi, ' ')
    .replace(/\d+/g, ' ')
    .replace(/[^a-z0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
}

export default function LogsSection({ serviceName }: LogsSectionProps) {
  // level은 태그에서 선택되면 그 값을 사용하고, 없으면 기본 ERROR 사용

  const [page, setPage] = useState(1);

  // 그룹 기반 페이징: 한 페이지에 표시할 그룹 수
  const groupsPerPage = 12;

  // 기본 태그 없음
  const [tags, setTags] = useState<Tag[]>([]);
  const [keyword, setKeyword] = useState(''); // keyword 검색을 위한 상태 추가

  // selected log / inner analysis state handled inside GroupPanel
  const [isLogGroupPanelOpen, setIsLogGroupPanelOpen] = useState(false);
  const [selectedLogGroup, setSelectedLogGroup] = useState<{
    key: string;
    title: string;
    items: LogEntry[];
  } | null>(null);

  const { startTime, endTime } = useTimeRangeStore();

  // 로그 목록 가져오기 (새 API)
  const {
    data: logsData,
    isLoading,
    isError,
  } = useQuery({
    // tags를 키에 포함하면 태그 변경 시 쿼리가 자동으로 다시 수행됩니다.
    queryKey: ['logs', serviceName, startTime, endTime, tags],
    queryFn: () => {
      const levelTag = tags.find((t) => t.key === 'level')?.value;
      const serviceTag = tags.find((t) => t.key === 'service')?.value;

      return getLogs({
        service_name: serviceTag || serviceName,
        from: startTime,
        to: endTime,
        size: 10000, // message 기반 키워드 추출 위해 size 증가(1만개)
        level: levelTag as LogLevel | undefined,
      });
    },
    refetchInterval: 30000, // 30초마다 갱신
    retry: false, // API 오류 시 재시도 하지 않음
    throwOnError: false, // 오류를 throw하지 않고 isError 상태로만 처리
  });

  // API 로그 데이터 변환
  const apiLogs = useMemo(() => {
    if (!logsData?.items) return [];
    return logsData.items.map((log) => ({
      id: `api-${log.service_name}-${log.timestamp}`,
      level: log.level as LogLevel,
      service: log.service_name,
      traceId: log.trace_id || '',
      message: log.message,
      timestamp: new Date(log.timestamp).toLocaleString('ko-KR'),
      spanId: log.span_id || '',
    }));
  }, [logsData]);

  // 로그 목록은 API에서 가져온 항목만 사용
  const logs = useMemo(() => apiLogs, [apiLogs]);

  // 자동 Suggestion 데이터
  const messageKeywords = useMemo(() => {
    const freq: Record<string, number> = {};
    logs.forEach((log) => {
      const words = log.message
        .toLowerCase()
        .replace(/[^a-z0-9 ]/gi, ' ')
        .split(/\s+/);
      words.forEach((w) => {
        if (w.length < 3) return;
        if (/^\d+$/.test(w)) return;
        freq[w] = (freq[w] || 0) + 1;
      });
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([w]) => w);
  }, [logs]);

  const serviceNames = useMemo(() => [...new Set(logs.map((l) => l.service))], [logs]);

  // 필터링
  const filteredLogs = useMemo(() => {
    let result = [...logs];

    tags.forEach(({ key, value }) => {
      const v = value;
      if (key === 'msg') {
        // msg 태그는 그룹화된 키(정규화된 메시지)와 일치하는 항목으로 필터링
        const nv = normalizeMessage(v);
        result = result.filter((l) => normalizeMessage(l.message) === nv);
      }
      if (key === 'service')
        result = result.filter((l) => l.service.toLowerCase().includes(v.toLowerCase()));
      if (key === 'level') result = result.filter((l) => l.level.toLowerCase() === v.toLowerCase());
    });

    if (keyword.trim()) {
      const k = keyword.toLowerCase();
      result = result.filter(
        (l) =>
          l.message.toLowerCase().includes(k) ||
          l.service.toLowerCase().includes(k) ||
          l.traceId.toLowerCase().includes(k),
      );
    }

    return result;
  }, [tags, keyword, logs]);

  // 그룹을 계산해서 페이지 수를 결정
  const groupsArr = useMemo(() => computeGroups(filteredLogs), [filteredLogs]);
  const totalPages = Math.max(1, Math.ceil(groupsArr.length / groupsPerPage));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">로그</h2>

      <div className="w-full flex items-center justify-start gap-4">
        <div className="flex-1">
          <TagSearchBar
            tags={tags}
            onTagsChange={(t) => {
              setTags(t);
              setPage(1);
            }}
            keyword={keyword}
            onKeywordChange={(v) => {
              setKeyword(v);
              setPage(1);
            }}
            messageKeywords={messageKeywords}
            serviceNames={serviceNames}
            placeholder="msg:메시지 내용 service:서비스 이름 level:로그 레벨 또는 일반 검색어 입력"
          />
        </div>
      </div>

      <section id="logs" className="flex flex-col gap-4 md:gap-6 scroll-mt-24">
        <StateHandler
          isLoading={isLoading}
          isError={isError}
          isEmpty={filteredLogs.length === 0}
          type="table"
          height={200}
        >
          {/* 그룹화 뷰 */}
          <div className="mb-4">
            <LogGroups
              items={filteredLogs}
              page={page}
              pageSize={groupsPerPage}
              onGroupClick={(key, title, items) => {
                setSelectedLogGroup({ key, title, items });
                setIsLogGroupPanelOpen(true);
              }}
            />
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPrev={() => setPage(page - 1)}
            onNext={() => setPage(page + 1)}
          />
        </StateHandler>
      </section>

      {/* 그룹 패널 */}
      {isLogGroupPanelOpen && selectedLogGroup && (
        <LogGroupPanel
          isOpen={isLogGroupPanelOpen}
          group={selectedLogGroup}
          onClose={() => setIsLogGroupPanelOpen(false)}
        />
      )}
    </div>
  );
}
