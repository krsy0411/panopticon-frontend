/**
 * 차트 포맷팅 유틸리티
 * - 시간 라벨 포맷팅
 * - X축 간격 계산
 * - Bar 폭 설정
 */

/**
 * interval 값에 따라 차트 x축 라벨 포맷팅
 * @param date - Date 객체
 * @param interval - API interval 값 (예: "1m", "5m", "10m", "1h", "2d")
 * @returns 포맷팅된 라벨 문자열
 */
export function formatChartTimeLabel(date: Date, interval: string): string {
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 매우 짧은 간격 (1분~3분): 시:분 표시
  if (['1m', '2m', '3m'].includes(interval)) {
    return `${hour}:${minute}`;
  }
  // 짧은 간격 (5분~30분): 시:분 표시
  else if (['5m', '10m', '30m'].includes(interval)) {
    return `${hour}:${minute}`;
  }
  // 중간 간격 (1시간~12시간): 시간만 표시
  else if (['1h', '2h', '12h'].includes(interval)) {
    return `${hour}h`;
  }
  // 긴 간격 (1일~2일): 월/일만 표시
  else if (['1d', '2d'].includes(interval)) {
    return `${month}/${day}`;
  }
  // 매우 긴 간격: 월/일만 표시
  else {
    return `${month}/${day}`;
  }
}

/**
 * interval 값에 따라 x축 라벨 표시 간격 계산
 * @param interval - API interval 값 (예: "1m", "5m", "10m", "1h", "2d")
 * @param dataLength - 데이터 포인트 개수
 * @returns x축 라벨 표시 간격 (0 = 모두 표시, 'auto' = 자동)
 */
export function getXAxisInterval(interval: string, dataLength: number): number | 'auto' {
  // 데이터가 적으면 모두 표시
  if (dataLength <= 6) return 0;
  if (dataLength <= 10) return 1;

  // interval에 따른 간격 조절
  switch (interval) {
    case '1m':
    case '2m':
    case '3m':
      return Math.floor(dataLength / 10); // ~10개 라벨
    case '5m':
    case '10m':
      return Math.floor(dataLength / 8); // ~8개 라벨
    case '30m':
    case '1h':
      return Math.floor(dataLength / 6); // ~6개 라벨
    case '2h':
    case '12h':
      return Math.floor(dataLength / 4); // ~4개 라벨
    case '1d':
    case '2d':
      return Math.floor(dataLength / 3); // ~3개 라벨
    default:
      return 'auto';
  }
}

/**
 * interval 값에 따라 bar width를 동적으로 계산
 * 기간이 길수록 bar가 더 얇아짐
 * @param interval - API interval 값 (예: "1m", "5m", "10m", "1h", "2d")
 * @returns bar width (픽셀 또는 비율)
 */
export function getBarWidth(interval: string): number | string {
  const barWidthMap: Record<string, number | string> = {
    '1m': '70%', // 매우 짧은 간격: 매우 굵음
    '2m': '65%',
    '3m': '60%',
    '5m': '60%', // 짧은 간격: 굵음
    '10m': '55%',
    '30m': '50%',
    '1h': '45%',
    '2h': '40%',
    '12h': '35%',
    '1d': '30%', // 긴 간격: 얇음
    '2d': '25%',
  };

  return barWidthMap[interval] || '35%'; // 기본값
}

/**
 * Resources 컴포넌트용 bar width 계산 (더 큰 폭)
 * 차트 크기가 작으므로 더 굵은 bar를 사용
 * @param interval - API interval 값 (예: "1m", "5m", "10m", "1h", "2d")
 * @returns bar width (픽셀 또는 비율)
 */
export function getBarWidthForResources(interval: string): number | string {
  const barWidthMap: Record<string, number | string> = {
    '1m': '80%', // 매우 짧은 간격: 매우 굵음
    '2m': '75%',
    '3m': '70%',
    '5m': '70%', // 짧은 간격: 굵음 (Resources는 차트 크기가 작으므로 더 큼)
    '10m': '65%',
    '30m': '60%',
    '1h': '55%',
    '2h': '50%',
    '12h': '45%',
    '1d': '40%', // 긴 간격: 얇음
    '2d': '35%',
  };

  return barWidthMap[interval] || '50%'; // 기본값
}

/**
 * Resources 컴포넌트용 x축 간격 계산
 * 차트 크기가 작으므로 더 큰 간격 사용
 * @param interval - API interval 값 (예: "1m", "5m", "10m", "1h", "2d")
 * @param dataLength - 데이터 포인트 개수
 * @returns x축 라벨 표시 간격 (0 = 모두 표시, 'auto' = 자동)
 */
export function getXAxisIntervalForResources(
  interval: string,
  dataLength: number,
): number | 'auto' {
  // 데이터가 적으면 모두 표시
  if (dataLength <= 6) return 0;
  if (dataLength <= 10) return 1;

  // interval에 따른 간격 조절 (Resources 차트는 좁으므로 더 큰 간격)
  switch (interval) {
    case '1m':
    case '2m':
    case '3m':
      return Math.floor(dataLength / 8); // ~8개 라벨
    case '5m':
    case '10m':
      return Math.floor(dataLength / 6); // ~6개 라벨
    case '30m':
    case '1h':
      return Math.floor(dataLength / 5); // ~5개 라벨
    case '2h':
    case '12h':
      return Math.floor(dataLength / 4); // ~4개 라벨
    case '1d':
    case '2d':
      return Math.floor(dataLength / 3); // ~3개 라벨
    default:
      return 'auto';
  }
}
