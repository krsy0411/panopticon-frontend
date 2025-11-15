export interface ApplicationSummary {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string | null;
}
