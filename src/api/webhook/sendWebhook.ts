/* eslint-disable @typescript-eslint/no-explicit-any */
function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;)s*' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export type Provider = 'slack' | 'discord' | 'teams';

export async function sendWebhook(provider: Provider, webhookUrl: string, payload: any) {
  if (!webhookUrl) throw new Error('webhookUrl is required');

  const token = getCookieValue('auth-token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`/api/webhook/${provider}`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({ webhookUrl, payload }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new Error(`Proxy error: ${res.status} ${JSON.stringify(errBody)}`);
  }

  return res.json();
}
