export type ServiceType = 'ui' | 'api';

export interface CreateServiceFormValues {
  serviceType: ServiceType;
  serviceName: string;
  framework: string;
  environment: string;
  collectLogs: boolean;
  collectTraces: boolean;
}

export type ServiceModalMode = 'create' | 'edit';

export interface CreateServiceModalProps {
  open: boolean;
  mode?: ServiceModalMode;
  onClose: () => void;
  initialValues?: Partial<CreateServiceFormValues>;
  onSubmit?: (values: CreateServiceFormValues) => void;
}

export const SERVICE_TYPE_OPTIONS = [
  { label: 'Frontend (UI / Browser)', value: 'ui' },
  { label: 'Backend (API / Server)', value: 'api' },
] as const;

export interface ServiceFrameworkOption {
  label: string;
  value: string;
  runtime: string;
}

export const SERVICE_FRAMEWORK_OPTIONS: Record<ServiceType, ServiceFrameworkOption[]> = {
  ui: [
    { label: 'Next.js', value: 'nextjs', runtime: 'Node.js' },
    { label: 'React', value: 'react', runtime: 'JavaScript (Browser)' },
    { label: 'Vue.js', value: 'vue', runtime: 'JavaScript (Browser)' },
    { label: 'Svelte', value: 'svelte', runtime: 'JavaScript (Browser)' },
  ],
  api: [
    { label: 'NestJS', value: 'nestjs', runtime: 'Node.js' },
    { label: 'Express', value: 'express', runtime: 'Node.js' },
    { label: 'FastAPI', value: 'fastapi', runtime: 'Python' },
    { label: 'Spring Boot', value: 'springboot', runtime: 'Java' },
  ],
};

export const SERVICE_ENVIRONMENT_OPTIONS = [
  { label: 'Docker', value: 'docker' },
  { label: 'Kubernetes', value: 'kubernetes' },
  { label: 'VM (EC2 등)', value: 'vm' },
  { label: 'Bare Metal', value: 'bare-metal' },
] as const;

export const getDefaultServiceFormValues = (
  overrides?: Partial<CreateServiceFormValues>,
): CreateServiceFormValues => {
  const defaultServiceType: ServiceType = overrides?.serviceType ?? SERVICE_TYPE_OPTIONS[0].value;
  const baseValues: CreateServiceFormValues = {
    serviceType: defaultServiceType,
    serviceName: '',
    framework: SERVICE_FRAMEWORK_OPTIONS[defaultServiceType][0]?.value ?? '',
    environment: SERVICE_ENVIRONMENT_OPTIONS[0].value,
    collectLogs: defaultServiceType === 'api',
    collectTraces: true,
  };

  const mergedValues: CreateServiceFormValues = { ...baseValues, ...overrides };

  if (!mergedValues.framework) {
    mergedValues.framework =
      SERVICE_FRAMEWORK_OPTIONS[mergedValues.serviceType][0]?.value ?? mergedValues.framework;
  }

  if (mergedValues.serviceType === 'ui') {
    mergedValues.collectLogs = false;
  }

  return mergedValues;
};
