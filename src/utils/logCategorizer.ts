/**
 * 로그 메시지를 분석하여 카테고리를 결정합니다.
 * 패턴 매칭을 통해 로그의 특성을 자동으로 분류합니다.
 *
 * ⚠️ 새로운 카테고리를 추가할 때:
 * 1. LogCategory 타입에 새 카테고리 추가
 * 2. categoryPriority에 우선순위 추가
 * 3. categoryDescriptions에 설명 추가
 * 4. patterns 배열에 패턴 규칙 추가 (상단에 있을수록 높은 우선순위)
 */

export type LogCategory =
  | 'REQUEST_DATA' // 요청 데이터 관련 (request, payload 등)
  | 'DATA_PROCESSING' // 데이터 처리/계산 (calculation, processing 등)
  | 'ACTION_TRACKING' // 사용자/시스템 액션 추적 (tracking, action 등)
  | 'OPERATION' // 작업 수행 (completed, finished, 시작/완료 등)
  | 'ERROR' // 에러 및 예외 (error, failed, exception)
  | 'GENERAL'; // 일반 로그

export interface LogCategoryInfo {
  category: LogCategory;
  priority: number;
  description: string;
}

/**
 * 카테고리별 우선순위 (숫자가 작을수록 높은 우선순위)
 * 로그 레벨과 별도로, 메시지 카테고리 자체도 우선순위를 가집니다.
 */
const categoryPriority: Record<LogCategory, number> = {
  ERROR: 0, // 에러 및 예외
  REQUEST_DATA: 1, // 요청 데이터
  DATA_PROCESSING: 2, // 데이터 처리/계산
  ACTION_TRACKING: 3, // 사용자/시스템 액션 추적
  OPERATION: 4, // 작업 수행
  GENERAL: 99, // 일반
};

/**
 * 카테고리별 설명
 */
const categoryDescriptions: Record<LogCategory, string> = {
  ERROR: '에러',
  REQUEST_DATA: '요청 데이터',
  DATA_PROCESSING: '데이터 처리',
  ACTION_TRACKING: '액션 추적',
  OPERATION: '작업 수행',
  GENERAL: '일반',
};

/**
 * 패턴 매칭 규칙
 *
 * ⚠️ 규칙 추가 시 주의:
 * - 패턴 순서가 중요합니다 (위에서부터 순서대로 매칭됨)
 * - 더 구체적인 패턴을 먼저 배치하세요
 * - 예: "error" 패턴이 가장 위에 있어야 에러 로그를 우선 분류함
 */
const patterns: Array<{
  regex: RegExp;
  category: LogCategory;
  description?: string; // 패턴 설명 (참고용)
}> = [
  // 에러 및 예외 (최상위 우선순위)
  {
    regex: /error|failed|exception|failed|failure|traceback/i,
    category: 'ERROR',
    description: '에러 및 예외 처리',
  },

  // 요청 데이터
  {
    regex: /request|payload|full\s+request|incoming|input/i,
    category: 'REQUEST_DATA',
    description: '요청 데이터 로깅',
  },

  // 데이터 처리/계산
  {
    regex: /calculation|processing|computed|calculate|metric|처리|계산|조회/i,
    category: 'DATA_PROCESSING',
    description: '데이터 처리/계산',
  },

  // 사용자/시스템 액션 추적
  {
    regex: /tracking|action|user|session|behavior|behavior|activity|page_view|started|began/i,
    category: 'ACTION_TRACKING',
    description: '액션 추적',
  },

  // 작업 수행 (시작, 완료 등)
  {
    regex: /completed|finished|done|성공|완료|시작|시작|complete|end/i,
    category: 'OPERATION',
    description: '작업 수행',
  },
];

/**
 * 로그 메시지에서 카테고리를 추출합니다.
 *
 * @param message - 로그 메시지
 * @returns 결정된 카테고리
 */
export function categorizeLog(message: string): LogCategory {
  if (!message) return 'GENERAL';

  // 패턴 순서대로 매칭 시도 (첫 번째 매칭되는 패턴 사용)
  for (const { regex, category } of patterns) {
    if (regex.test(message)) {
      return category;
    }
  }

  return 'GENERAL';
}

/**
 * 카테고리의 우선순위를 반환합니다.
 *
 * @param category - 로그 카테고리
 * @returns 우선순위 (숫자가 작을수록 높음)
 */
export function getCategoryPriority(category: LogCategory): number {
  return categoryPriority[category] ?? 99;
}

/**
 * 카테고리의 설명을 반환합니다.
 *
 * @param category - 로그 카테고리
 * @returns 카테고리 설명
 */
export function getCategoryDescription(category: LogCategory): string {
  return categoryDescriptions[category] || '알 수 없음';
}

/**
 * 카테고리 정보를 반환합니다.
 *
 * @param category - 로그 카테고리
 * @returns 카테고리 정보 (카테고리, 우선순위, 설명)
 */
export function getCategoryInfo(category: LogCategory): LogCategoryInfo {
  return {
    category,
    priority: getCategoryPriority(category),
    description: getCategoryDescription(category),
  };
}

/**
 * 모든 카테고리의 정보를 반환합니다.
 * UI에서 카테고리별 필터링이나 범례 표시 시 사용
 *
 * @returns 카테고리별 정보 배열 (우선순위 순서)
 */
export function getAllCategories(): LogCategoryInfo[] {
  const categories: LogCategory[] = [
    'ERROR',
    'REQUEST_DATA',
    'DATA_PROCESSING',
    'ACTION_TRACKING',
    'OPERATION',
    'GENERAL',
  ];

  return categories.map(getCategoryInfo).sort((a, b) => a.priority - b.priority);
}
