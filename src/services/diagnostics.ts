type ClientLogType = 'window_error' | 'unhandled_rejection' | 'console_error' | 'api_error';
type ClientLogLevel = 'error' | 'warn';

const API_ENDPOINT = '/api/client-logs';
const STORAGE_KEY = 'Emdash-portfolio-session-id';
const MAX_EVENTS = 20;
const DEDUP_WINDOW_MS = 10_000;

const dedupMap = new Map<string, number>();
let sentCount = 0;
let installed = false;

const getSessionId = (): string | undefined => {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY) || undefined;
    return value || undefined;
  } catch {
    return undefined;
  }
};

const normalizeMessage = (value: unknown): string => {
  if (value instanceof Error) return value.message || String(value);
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const sendClientLog = (payload: {
  level?: ClientLogLevel;
  type: ClientLogType;
  message: string;
  stack?: string;
  source?: string;
  line?: number;
  column?: number;
  extra?: Record<string, unknown>;
}) => {
  if (sentCount >= MAX_EVENTS) return;

  const dedupKey = `${payload.type}:${payload.message}:${payload.source || ''}`;
  const now = Date.now();
  const lastSent = dedupMap.get(dedupKey) || 0;
  if (now - lastSent < DEDUP_WINDOW_MS) return;

  dedupMap.set(dedupKey, now);
  sentCount += 1;

  const body = JSON.stringify({
    level: payload.level || 'error',
    type: payload.type,
    message: payload.message.slice(0, 4000),
    stack: payload.stack?.slice(0, 12000),
    source: payload.source,
    line: payload.line,
    column: payload.column,
    page: window.location.href,
    userAgent: navigator.userAgent,
    sessionId: getSessionId(),
    extra: payload.extra
  });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(API_ENDPOINT, blob);
      return;
    }
  } catch {
    // Fall through to fetch
  }

  fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true
  }).catch(() => undefined);
};

export const setupClientDiagnostics = () => {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  window.addEventListener('error', (event) => {
    sendClientLog({
      type: 'window_error',
      message: event.message || 'Unknown window error',
      stack: event.error?.stack,
      source: event.filename,
      line: event.lineno,
      column: event.colno
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    sendClientLog({
      type: 'unhandled_rejection',
      message: normalizeMessage(reason),
      stack: reason instanceof Error ? reason.stack : undefined
    });
  });

  const originalConsoleError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    try {
      const message = args.map(normalizeMessage).join(' ');
      sendClientLog({
        type: 'console_error',
        message: message || 'console.error called without message'
      });
    } catch {
      // Keep original behavior even when diagnostics processing fails
    }
    originalConsoleError(...args);
  };
};

