export type LogLevel = 'ERROR' | 'WARNING' | 'INFO';

export type LogEntry = {
  id: string;
  level: LogLevel;
  service: string;
  traceId: string;
  message: string;
  timestamp: string;
};

export type StatItem = {
  id: string;
  label: string;
  value: number;
  tone?: 'neutral' | 'danger' | 'warning' | 'info';
};
