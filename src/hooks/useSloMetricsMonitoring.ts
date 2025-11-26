/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getServiceMetrics } from '@/src/api/apm';
import { getSlos, updateSlo } from '@/src/api/slo';
import { getWebhooks } from '@/src/api/webhook';
import { calculateSliFromMetric, deriveSloStatus } from '@/src/utils/sloCalculations';
import {
  createSlackPayload,
  createDiscordPayload,
  createTeamsPayload,
} from '@/src/utils/webhookPayload';

interface SloData {
  id: string;
  name: string;
  metric: 'latency' | 'error_rate' | 'availability';
  target: number;
  sliValue: number;
  actualDowntimeMinutes: number;
  connectedChannels: string[];
}

interface MonitoringState {
  sloId: string;
  currentSliValue: number;
  previousStatus: string;
  currentStatus: string;
  hasAlerted: boolean;
  lastAlertTime: number;
}

/**
 * SLO 메트릭 모니터링 훅
 * - 서비스 메트릭을 1분마다 폴링
 * - SLI 값 및 actualDowntimeMinutes 계산
 * - updateSlo API를 통해 authserver에 갱신
 * - 상태 변화 감지 및 알림 발송
 */
export function useSloMetricsMonitoring(serviceName: string) {
  const [monitoringState, setMonitoringState] = useState<Record<string, MonitoringState>>({});
  const alertedSlosRef = useRef<Record<string, boolean>>({});

  // SLO 목록 가져오기
  const { data: slos = [] } = useQuery({
    queryKey: ['slos'],
    queryFn: getSlos,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 5 * 60 * 1000,
  });

  // 웹훅 정보 가져오기
  const { data: webhooks = [] } = useQuery({
    queryKey: ['webhooks'],
    queryFn: getWebhooks,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // 서비스 메트릭 폴링 (1분 주기)
  const { data: metrics } = useQuery({
    queryKey: ['serviceMetrics', serviceName],
    queryFn: () => getServiceMetrics(serviceName),
    refetchInterval: 60000, // 1분(60초)마다 폴링
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  // 메트릭에서 특정 메트릭 값 추출
  const getMetricValue = useCallback(
    (metricName: string): number | null => {
      if (!metrics) return null;

      const metricsArray = Array.isArray(metrics) ? metrics : [metrics];
      const metric = metricsArray.find((m) => m.metric_name === metricName);

      if (!metric || !metric.points || metric.points.length === 0) {
        return null;
      }

      // 가장 최근 값 사용
      return metric.points[metric.points.length - 1].value;
    },
    [metrics],
  );

  // 알림 발송 함수
  const dispatchAlert = useCallback(
    async (slo: SloData, _sliValue: number, metricValue: number) => {
      try {
        for (const channel of slo.connectedChannels) {
          const webhook = webhooks.find((w) => w.type === channel && w.enabled);
          if (!webhook) continue;

          let payload: Record<string, unknown>;

          // 채널별로 메시지 포맷 생성
          switch (channel) {
            case 'slack':
              payload = createSlackPayload(slo.name, slo.metric, slo.target, metricValue);
              break;
            case 'discord':
              payload = createDiscordPayload(slo.name, slo.metric, slo.target, metricValue);
              break;
            case 'teams':
              payload = createTeamsPayload(slo.name, slo.metric, slo.target, metricValue);
              break;
            default:
              console.warn(`Unsupported channel type: ${channel}`);
              continue;
          }

          // 프록시 API를 통해 웹훅 발송
          const proxyUrl = `/api/webhook/${channel}`;
          const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              webhookUrl: webhook.webhookUrl,
              payload,
            }),
          });

          if (!response.ok) {
            console.error(
              `Failed to send ${channel} alert for SLO ${slo.id}:`,
              response.statusText,
            );
          } else {
            console.log(`[SLO Alert] ${channel}: ${slo.name}`);
          }
        }
      } catch (error) {
        console.error('Failed to dispatch alert:', error);
      }
    },
    [webhooks],
  );

  // SLO 상태 업데이트 및 알림 발송 로직
  useEffect(() => {
    if (!slos.length || !metrics) return;

    const updateSloAndAlert = async () => {
      for (const slo of slos) {
        try {
          let metricValue: number | null = null;

          // 메트릭 타입에 따라 메트릭 값 가져오기
          switch (slo.metric) {
            case 'latency':
              metricValue = getMetricValue('latency_p95_ms');
              break;
            case 'error_rate':
              metricValue = getMetricValue('error_rate');
              break;
            case 'availability':
              metricValue = getMetricValue('error_rate');
              break;
          }

          if (metricValue === null) continue;

          // SLI 값 계산
          const newSliValue = calculateSliFromMetric(slo.metric, metricValue, slo.target);

          // actualDowntimeMinutes 계산
          // SLI가 목표 미만이면 1분 추가 (폴링 주기 = 1분)
          const actualDowntimeMinutes =
            newSliValue < slo.target ? slo.actualDowntimeMinutes + 1 : slo.actualDowntimeMinutes;

          // 상태 판정
          const newStatus = deriveSloStatus(newSliValue, slo.target);
          const previousState = monitoringState[slo.id];
          const previousStatus = previousState?.currentStatus || 'GOOD';

          // 값이 변경되었을 경우만 업데이트
          if (
            Math.abs(newSliValue - slo.sliValue) > 0.001 ||
            actualDowntimeMinutes !== slo.actualDowntimeMinutes
          ) {
            await updateSlo(slo.id, {
              sliValue: newSliValue,
              actualDowntimeMinutes: actualDowntimeMinutes,
            });
          }

          // 상태 변화 감지 및 알림 발송
          if (
            previousStatus !== newStatus &&
            newStatus === 'FAILED' &&
            !alertedSlosRef.current[slo.id]
          ) {
            // GOOD/WARNING → FAILED 전환 시 알림 발송
            await dispatchAlert(slo, newSliValue, metricValue);
            alertedSlosRef.current[slo.id] = true;
          }

          // FAILED → GOOD 전환 시 알림 플래그 리셋
          if (previousStatus === 'FAILED' && newStatus !== 'FAILED') {
            alertedSlosRef.current[slo.id] = false;
          }

          // 상태 업데이트
          setMonitoringState((prev) => ({
            ...prev,
            [slo.id]: {
              sloId: slo.id,
              currentSliValue: newSliValue,
              previousStatus,
              currentStatus: newStatus,
              hasAlerted: alertedSlosRef.current[slo.id],
              lastAlertTime: alertedSlosRef.current[slo.id] ? Date.now() : 0,
            },
          }));
        } catch (error) {
          console.error(`Failed to update SLO ${slo.id}:`, error);
        }
      }
    };

    updateSloAndAlert();
  }, [metrics, slos, getMetricValue, dispatchAlert]);

  return {
    monitoringState,
    metrics,
  };
}
