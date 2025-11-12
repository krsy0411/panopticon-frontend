// Heatmap placeholder
'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { EChartsOption } from 'echarts';

import Table from '@/components/ui/Table';
import { useQuery } from '@tanstack/react-query';
import { getServiceErrors } from '@/src/api/apm';
import { useTimeRangeStore } from '@/src/store/timeRangeStore';
import { ErrorItem } from '@/types/apm';

const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

interface ErrorDistributionProps {
  serviceName: string;
}

export default function ErrorDistribution({ serviceName }: ErrorDistributionProps) {
  const { startTime, endTime } = useTimeRangeStore();

  const { data: errorData } = useQuery({
    queryKey: ['serviceErrors', serviceName, startTime, endTime],
    queryFn: () => getServiceErrors(serviceName, { start_time: startTime, end_time: endTime }),
  });

  const errors = errorData?.errors || [];
  const resources = [...new Set(errors.map((e) => e.resource))];
  const services = [...new Set(errors.map((e) => e.service_name))];

  // Heatmap 데이터
  const heatmapData: [number, number, number][] = errors.map((e) => [
    resources.indexOf(e.resource),
    services.indexOf(e.service_name),
    e.count,
  ]);
  const maxCount = Math.max(...errors.map((e) => e.count), 0);

  // Heatmap 옵션
  const option: EChartsOption = {
    tooltip: {
      position: 'top',
      backgroundColor: 'rgba(0,0,0,0.8)',
      textStyle: { color: '#fff', fontSize: 12 },
      formatter: (params) => {
        if (!Array.isArray(params) || !params[0]?.value) return '';
        const value = params[0].value as [number, number, number];
        const service = services[value[1]];
        const resource = resources[value[0]];
        const count = value[2];
        return `<b>${service}</b><br/>${resource}<br/>Count: ${count}`;
      },
    },
    grid: { top: 60, right: 30, bottom: 90, left: 120 },
    xAxis: {
      type: 'category',
      data: resources,
      axisLabel: { color: '#6b7280', fontSize: 11, rotate: 0 },
    },
    yAxis: {
      type: 'category',
      data: services,
      axisLabel: { color: '#6b7280', fontSize: 12 },
    },
    visualMap: {
      min: 0,
      max: maxCount,
      calculable: true,
      orient: 'horizontal',
      bottom: 10,
      left: 'center',
      inRange: { color: ['#bfdbfe', '#3b82f6', '#1e3a8a'] },
    },
    series: [
      {
        name: 'Error Distribution',
        type: 'heatmap',
        data: heatmapData,
        label: {
          show: true,
          formatter: (p) => {
            const value = p.value as [number, number, number];
            return value[2] > 0 ? `${value[2]}` : '';
          },
          color: '#111827',
          fontSize: 10,
        },
      },
    ],
  };

  // Heatmap 클릭 → 테이블 행 스크롤 & 하이라이트
  const onEvents = {
    click: (params: { value: [number, number, number] }) => {
      const value = params.value as [number, number, number];
      const service = services[value[1]];
      const resource = resources[value[0]];
      const rowId = `row-${service}-${resource}`;
      const target = document.getElementById(rowId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('bg-blue-100'); // 파란색 강조
        setTimeout(() => target.classList.remove('bg-blue-100'), 1500);
      }
    },
  };

  // Table 컬럼 정의
  const COLUMNS: {
    key: keyof ErrorItem;
    header: string;
    width?: string;
    sortable?: boolean;
    render?: (value: unknown, row: ErrorItem) => React.ReactNode;
  }[] = [
    { key: 'error_message', header: 'Error Message', width: '40%', sortable: true },
    { key: 'service_name', header: 'Service', width: '20%', sortable: true },
    { key: 'resource', header: 'Resource', width: '25%', sortable: true },
    {
      key: 'count',
      header: 'Count',
      width: '10%',
      sortable: true,
      render: (v) => <span className="text-red-600 font-semibold">{v as number}</span>,
    },
    {
      key: 'last_seen',
      header: 'Last Seen',
      width: '10%',
      sortable: true,
      render: (v) => new Date(v as string).toLocaleTimeString('en-US', { hour12: false }),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Heatmap */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Error Distribution</h2>
        <ReactECharts option={option} onEvents={onEvents} style={{ height: 400 }} />
      </div>

      {/* Table */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Error List</h2>
        <Table<ErrorItem>
          columns={COLUMNS}
          data={errors}
          className="rounded-lg"
          getRowId={(row) => `row-${row.service_name}-${row.resource}`} // id 연결
        />
      </div>
    </div>
  );
}
