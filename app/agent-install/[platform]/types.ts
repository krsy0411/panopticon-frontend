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
