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

export type PlatformType =
  | 'kubernetes'
  | 'docker'
  | 'ecs'
  | 'macos'
  | 'opentelemetry'
  | 'fluentbit';

export interface PlatformData {
  icon: React.ReactNode;
  iconLarge: React.ReactNode;
  title: string;
  description: string;
  steps: InstallationStep[];
  category: 'Container Platform' | 'Host based' | 'Monitoring' | 'Log Collection';
}

// Application Monitoring Types
export type FrameworkType = 'nodejs' | 'nextjs' | 'python';

export interface InstallationStep {
  title: string;
  description?: string;
  code?: string;
  language?: string;
}

export interface FrameworkData {
  icon: React.ReactNode;
  iconLarge: React.ReactNode;
  title: string;
  description: string;
  category: 'Backend' | 'Frontend' | 'Fullstack';
  steps: InstallationStep[];
  packageManager?: 'npm' | 'pip' | 'go';
}
