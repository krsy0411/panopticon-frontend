/**
 * 통합 상태 처리 컴포넌트
 * 로딩, 에러, 빈 상태를 조건에 따라 동적으로 렌더링
 */

import React from 'react';
import { FiInbox, FiBarChart2, FiAlertCircle, FiLoader } from 'react-icons/fi';

export type StateType = 'chart' | 'table' | 'general';

interface StateHandlerProps {
  /**
   * 로딩 중 여부
   */
  isLoading?: boolean;
  /**
   * 에러 발생 여부
   */
  isError?: boolean;
  /**
   * 데이터 없음 여부
   */
  isEmpty?: boolean;
  /**
   * 상태 타입 (아이콘 결정)
   * @default 'general'
   */
  type?: StateType;
  /**
   * 높이 (차트 영역에 맞추기 위해)
   * @default '300px'
   */
  height?: string | number;
  /**
   * 커스텀 메시지
   */
  loadingMessage?: string;
  errorMessage?: string;
  emptyMessage?: string;
  /**
   * 실제 컨텐츠 (정상 상태일 때 렌더링)
   */
  children: React.ReactNode;
}

const emptyIconMap: Record<StateType, React.ReactNode> = {
  chart: <FiBarChart2 className="w-12 h-12 text-gray-300" />,
  table: <FiInbox className="w-12 h-12 text-gray-300" />,
  general: <FiInbox className="w-12 h-12 text-gray-300" />,
};

const defaultEmptyMessages: Record<StateType, string> = {
  chart: '표시할 데이터가 없습니다',
  table: '항목이 없습니다',
  general: '데이터가 없습니다',
};

export default function StateHandler({
  isLoading = false,
  isError = false,
  isEmpty = false,
  type = 'general',
  height = '300px',
  loadingMessage = '데이터를 불러오는 중...',
  errorMessage = '데이터를 불러올 수 없습니다',
  emptyMessage,
  children,
}: StateHandlerProps) {
  const containerStyle = {
    height: typeof height === 'number' ? `${height}px` : height,
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center" style={containerStyle}>
        <FiLoader className="w-10 h-10 text-blue-500 animate-spin mb-3" />
        <p className="text-base font-medium text-gray-600">{loadingMessage}</p>
      </div>
    );
  }

  // 에러 상태
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center text-center" style={containerStyle}>
        <FiAlertCircle className="w-12 h-12 text-red-400 mb-3" />
        <p className="text-base font-medium text-gray-600 mb-1">{errorMessage}</p>
        <p className="text-sm text-gray-400">잠시 후 다시 시도해주세요</p>
      </div>
    );
  }

  // 빈 상태
  if (isEmpty) {
    const displayMessage = emptyMessage || defaultEmptyMessages[type];
    return (
      <div className="flex flex-col items-center justify-center text-center" style={containerStyle}>
        <div className="mb-3">{emptyIconMap[type]}</div>
        <p className="text-base font-medium text-gray-600 mb-1">{displayMessage}</p>
        <p className="text-sm text-gray-400">다른 시간 범위를 선택해보세요</p>
      </div>
    );
  }

  // 정상 상태: 실제 컨텐츠 렌더링
  return <>{children}</>;
}
