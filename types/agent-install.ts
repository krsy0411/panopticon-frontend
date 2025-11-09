export type InstallStep = 1 | 2 | 3 | 4;

export interface MonitoringOptions {
  traces: boolean;
  metrics: boolean;
  logs: boolean;
}

export interface StepConfig {
  total: number;
  showOptions: boolean;
}

export type PlatformType = 'kubernetes' | 'docker' | 'ecs' | 'macos' | 'opentelemetry';

export interface PlatformData {
  icon: React.ReactNode;
  iconLarge: React.ReactNode;
  title: string;
  description: string;
  command: string;
  category: 'Container Platform' | 'Host based' | 'Monitoring';
}
