import { useEffect, useRef } from 'react';
import { LogItem } from '@/types/apm';

interface UseErrorLogsWebSocketOptions {
  serviceName?: string;
  onLogReceived: (log: LogItem) => void;
  enabled?: boolean;
}

/**
 * 에러 로그를 실시간으로 수신하는 웹소켓 훅
 * @param serviceName - 특정 서비스의 로그만 수신 (선택사항)
 * @param onLogReceived - 로그 수신 시 호출되는 콜백 함수
 * @param enabled - 웹소켓 연결 활성화 여부 (기본값: true)
 */
export function useErrorLogsWebSocket({
  serviceName,
  onLogReceived,
  enabled = true,
}: UseErrorLogsWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3초

  // 최신 콜백을 항상 참조하기 위한 ref
  const onLogReceivedRef = useRef(onLogReceived);

  useEffect(() => {
    // 콜백 ref를 useEffect 내에서 업데이트
    onLogReceivedRef.current = onLogReceived;
  });

  useEffect(() => {
    const connect = (): void => {
      const wsUrl = process.env.NEXT_PUBLIC_WS_ERROR_LOGS_URL;

      if (!wsUrl) {
        console.warn(
          '웹소켓 URL이 설정되지 않았습니다. NEXT_PUBLIC_WS_ERROR_LOGS_URL 환경변수를 확인하세요.',
        );
        return;
      }

      if (!enabled) {
        return;
      }

      // 이미 연결되어 있으면 재연결하지 않음
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('에러 로그 웹소켓 연결됨');
          reconnectAttemptsRef.current = 0;

          // 특정 서비스 구독 메시지 전송 (필요 시)
          if (serviceName) {
            ws.send(
              JSON.stringify({
                type: 'subscribe',
                service_name: serviceName,
              }),
            );
          }
        };

        ws.onmessage = (event) => {
          try {
            const log: LogItem = JSON.parse(event.data);

            // ERROR 레벨 로그만 처리
            if (log.level === 'ERROR') {
              onLogReceivedRef.current(log);
            }
          } catch (error) {
            console.error('로그 파싱 오류:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('웹소켓 오류:', error);
        };

        ws.onclose = (event) => {
          console.log('웹소켓 연결 종료:', event.code, event.reason);

          // 정상 종료가 아니고 재연결 시도 횟수가 남아있으면 재연결
          if (enabled && !event.wasClean && reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current += 1;
            console.log(
              `웹소켓 재연결 시도 ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`,
            );

            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, reconnectDelay);
          }
        };
      } catch (error) {
        console.error('웹소켓 연결 실패:', error);
      }
    };

    const disconnect = (): void => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
        wsRef.current = null;
      }

      reconnectAttemptsRef.current = 0;
    };

    connect();

    return () => {
      disconnect();
    };
  }, [serviceName, enabled]);
}
