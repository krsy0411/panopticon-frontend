/**
 * 차트 포맷팅 유틸리티
 * - 시간 라벨 포맷팅
 * - X축 간격 계산
 * - Bar 폭 설정
 */

/**
 * interval 값에 따라 차트 x축 라벨 포맷팅
 * @param date - Date 객체
 * @param interval - API interval 값 (예: "20s", "30s", "45s", "1m", "3m", "7m", "9m", "12m", "25m", "2h", "3h", "4h", "12h")
 * @returns 포맷팅된 라벨 문자열
 */
export function formatChartTimeLabel(date: Date, interval: string): string {
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  const second = date.getSeconds().toString().padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  // 초 단위 간격 (20초, 30초, 45초): 시:분:초 표시
  if (['20s', '30s', '45s'].includes(interval)) {
    return `${hour}:${minute}:${second}`;
  }
  // 매우 짧은 간격 (1분~3분): 시:분 표시
  else if (['1m', '3m'].includes(interval)) {
    return `${hour}:${minute}`;
  }
  // 짧은 간격 (7분~25분): 시:분 표시
  else if (['7m', '9m', '12m', '25m'].includes(interval)) {
    return `${hour}:${minute}`;
  }
  // 중간 간격 (2시간~12시간): 시간만 표시
  else if (['2h', '3h', '4h', '12h'].includes(interval)) {
    return `${hour}h`;
  }
  // 긴 간격 (1일 이상): 월/일 HH:mm 표시
  else {
    return `${month}/${day} ${hour}:${minute}`;
  }
}

/**
 * interval 값에 따라 x축 라벨 표시 간격 계산 (일정한 간격)
 * interval 값에 기반하여 고정된 간격을 반환하여 일관성 있는 라벨 배치
 * @param interval - API interval 값 (예: "20s", "30s", "45s", "1m", "3m", "7m", "9m", "12m", "25m", "2h", "3h", "4h", "12h")
 * @returns x축 라벨 표시 간격 (0 = 모두 표시, 숫자 = 해당 간격)
 */
export function getXAxisInterval(interval: string): number {
  // interval에 따른 고정 간격 설정 (interval 자체를 기반으로 일정한 간격 보장)
  switch (interval) {
    case '20s':
      return 3; // 20초 × 3 = 60초 (1분마다 라벨)
    case '30s':
      return 2; // 30초 × 2 = 60초 (1분마다 라벨)
    case '45s':
      return 2; // 45초 × 2 = 90초 (약 1.5분마다 라벨)
    case '1m':
      return 5; // 1분 × 5 = 5분마다 라벨
    case '3m':
      return 5; // 3분 × 5 = 15분마다 라벨
    case '7m':
      return 3; // 7분 × 3 = 21분마다 라벨
    case '9m':
      return 3; // 9분 × 3 = 27분마다 라벨
    case '12m':
      return 3; // 12분 × 3 = 36분마다 라벨
    case '25m':
      return 2; // 25분 × 2 = 50분마다 라벨
    case '2h':
      return 2; // 2시간 × 2 = 4시간마다 라벨
    case '3h':
      return 2; // 3시간 × 2 = 6시간마다 라벨
    case '4h':
      return 2; // 4시간 × 2 = 8시간마다 라벨
    case '12h':
      return 2; // 12시간 × 2 = 24시간(1일)마다 라벨
    default:
      return 1; // 기본값
  }
}

/**
 * interval 값에 따라 bar width를 동적으로 계산
 * 기간이 길수록 bar가 더 얇아짐
 * @param interval - API interval 값 (예: "20s", "30s", "45s", "1m", "3m", "7m", "9m", "12m", "25m", "2h", "3h", "4h", "12h")
 * @returns bar width (픽셀 또는 비율)
 */
export function getBarWidth(interval: string): number | string {
  const barWidthMap: Record<string, number | string> = {
    '20s': '75%', // 초 단위: 매우 굵음
    '30s': '72%',
    '45s': '70%',
    '1m': '70%', // 매우 짧은 간격: 매우 굵음
    '3m': '62%', // 짧은 간격: 굵음
    '7m': '58%',
    '9m': '56%',
    '12m': '55%',
    '25m': '50%',
    '2h': '42%',
    '3h': '40%',
    '4h': '38%',
    '12h': '35%', // 긴 간격: 얇음
  };

  return barWidthMap[interval] || '35%'; // 기본값
}

/**
 * interval 값에 따라 ECharts 시간 축 포맷 문자열 반환
 * @param interval - API interval 값 (예: "20s", "30s", "45s", "1m", "3m", "7m", "9m", "12m", "25m", "2h", "3h", "4h", "12h")
 * @returns ECharts formatter 문자열 (예: "{HH}:{mm}:{ss}", "{MM}/{dd} {HH}:{mm}")
 */
export function getTimeAxisFormatter(interval: string): string {
  // 초 단위 간격: 시:분:초
  if (['20s', '30s', '45s'].includes(interval)) {
    return '{HH}:{mm}:{ss}';
  }
  // 짧은 간격 (1분~25분): 시:분
  else if (['1m', '3m', '7m', '9m', '12m', '25m'].includes(interval)) {
    return '{HH}:{mm}';
  }
  // 중간 간격 (2시간~12시간): 시간만
  else if (['2h', '3h', '4h', '12h'].includes(interval)) {
    return '{HH}h';
  }
  // 긴 간격 (1일 이상): 월/일 HH:mm
  else {
    return '{MM}/{dd} {HH}:{mm}';
  }
}

/**
 * interval 값에 따라 시간 기반 X축의 bar 최대 폭 반환
 * 짧은 간격일수록 넓고, 긴 간격일수록 좁음
 * @param interval - API interval 값 (예: "20s", "30s", "45s", "1m", "3m", "7m", "9m", "12m", "25m", "2h", "3h", "4h", "12h")
 * @returns bar 최대 폭 (픽셀)
 */
export function getBarMaxWidthForTimeAxis(interval: string): number {
  const barMaxWidthMap: Record<string, number> = {
    '20s': 29, // 20초: 가장 넓음 (45개 포인트)
    '30s': 27, // 30초: 넓음 (60개 포인트)
    '45s': 26, // 45초: 넓음 (60개 포인트)
    '1m': 25, // 1분: 넓음 (60개 포인트)
    '3m': 23, // 3분: 넓음 (60개 포인트)
    '7m': 22, // 7분: 중간 (51개 포인트)
    '9m': 21, // 9분: 중간 (60개 포인트)
    '12m': 21, // 12분: 중간 (60개 포인트)
    '25m': 20, // 25분: 중간 (57개 포인트)
    '2h': 19, // 2시간: 좁음 (약 70개 포인트)
    '3h': 18, // 3시간: 더 좁음 (약 56개 포인트)
    '4h': 17, // 4시간: 더 좁음 (약 42개 포인트)
    '12h': 16, // 12시간: 더 좁음 (60개 포인트)
  };

  return barMaxWidthMap[interval] || 15; // 기본값
}
