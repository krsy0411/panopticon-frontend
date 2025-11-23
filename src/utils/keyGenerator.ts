/**
 * License Key 생성 유틸리티
 * 프로덕션에서는 백엔드 API로 대체
 */

/**
 * 간단한 License Key 생성
 * 형식: ppt_[서비스명]_[난수]_[타임스탬프]
 */
export function generateLicenseKey(serviceName: string): string {
  // 서비스명 정규화 (특수문자 제거, 소문자)
  const cleanServiceName = serviceName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 10);

  // 난수 생성 (12자리)
  const randomPart = Math.random().toString(36).substring(2, 14).padEnd(12, '0');

  // 타임스탬프 (16진수)
  const timestamp = Date.now().toString(16);

  // 최종 키 포맷: ppt_servicename_randompart_timestamp
  return `ppt_${cleanServiceName}_${randomPart}_${timestamp}`;
}

/**
 * 키 마스킹 (일부만 보이게)
 * 예: ppt_***...***abc123
 */
export function maskLicenseKey(key: string): string {
  if (key.length <= 8) return key;
  const visibleStart = key.substring(0, 4);
  const visibleEnd = key.substring(key.length - 6);
  return `${visibleStart}***...***${visibleEnd}`;
}

/**
 * 키가 유효한 형식인지 확인
 */
export function isValidLicenseKey(key: string): boolean {
  return /^ppt_[a-z0-9_]+$/.test(key) && key.length >= 20;
}
