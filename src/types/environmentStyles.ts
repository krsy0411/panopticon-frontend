const normalizeEnvironmentKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

type EnvironmentStyle = { chip: string; dot: string };

const environmentStyles: Record<string, EnvironmentStyle> = {
  production: { chip: 'bg-red-50 text-red-700 border border-red-100', dot: 'bg-red-500' },
  prod: { chip: 'bg-red-50 text-red-700 border border-red-100', dot: 'bg-red-500' },
  staging: { chip: 'bg-amber-50 text-amber-700 border border-amber-100', dot: 'bg-amber-500' },
  stage: { chip: 'bg-amber-50 text-amber-700 border border-amber-100', dot: 'bg-amber-500' },
  development: { chip: 'bg-blue-50 text-blue-700 border border-blue-100', dot: 'bg-blue-500' },
  dev: { chip: 'bg-blue-50 text-blue-700 border border-blue-100', dot: 'bg-blue-500' },
  qa: { chip: 'bg-purple-50 text-purple-700 border border-purple-100', dot: 'bg-purple-500' },
  docker: { chip: 'bg-sky-50 text-sky-700 border border-sky-100', dot: 'bg-sky-500' },
  kubernetes: { chip: 'bg-emerald-50 text-emerald-700 border border-emerald-100', dot: 'bg-emerald-500' },
  k8s: { chip: 'bg-emerald-50 text-emerald-700 border border-emerald-100', dot: 'bg-emerald-500' },
  vm: { chip: 'bg-yellow-50 text-yellow-700 border border-yellow-100', dot: 'bg-yellow-500' },
  baremetal: { chip: 'bg-slate-100 text-slate-700 border border-slate-200', dot: 'bg-slate-500' },
};

const defaultStyle: EnvironmentStyle = {
  chip: 'bg-gray-100 text-gray-700 border border-gray-200',
  dot: 'bg-gray-400',
};

export const getEnvironmentStyle = (environment: string): EnvironmentStyle => {
  const normalized = normalizeEnvironmentKey(environment);
  return environmentStyles[normalized] ?? defaultStyle;
};
