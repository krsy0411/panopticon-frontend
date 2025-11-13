export interface ApplicationSummary {
  id: string;
  name: string;
  description?: string;

  serviceCount: number;

  errorCount: number; // 오늘 에러 수
  errorDiff: number; // 전날 대비 증감

  requestCount: number; // 오늘 요청 수
  requestDiff: number; // 전날 대비 증감

  createdAt: string;
}
