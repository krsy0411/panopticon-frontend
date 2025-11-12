import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * 브라우저 환경에서 MSW Service Worker를 설정합니다.
 * 이 worker는 클라이언트에서 발생하는 fetch/XHR 요청을 가로챕니다.
 */
export const worker = setupWorker(...handlers);
