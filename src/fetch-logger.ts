import type { RequestInterceptor, ResponseInterceptor } from './extend-fetch';

const log = console.log;

const isBodyLoggingDisabled = process.env.NEXT_PUBLIC_DISABLE_FETCH_BODY_LOGGING === 'true';

const RESET = '\x1b[0m';

const BRIGHT = '\x1b[1m';

const TEXT = {
  BLACK: '\x1b[30m',
  GRAY: '\x1b[38;2;187;187;187m',
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  WHITE: '\x1b[37m',
};

const getNowString = () => {
  const now = new Date();
  return `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
};

export const logRequestInterceptor: RequestInterceptor = async requestArgs => {
  const url = new URL(requestArgs[0]);
  const request = requestArgs[1];

  log(
    `${BRIGHT}${TEXT.BLUE}%s${RESET} ` +
      `${BRIGHT}${TEXT.MAGENTA}%s${RESET} ` +
      `${BRIGHT}${TEXT.YELLOW}%s${RESET} ` +
      `${TEXT.CYAN}%s${RESET}\r\n${isBodyLoggingDisabled ? '' : `${TEXT.GRAY}%s${RESET}\r\n`}`,
    '🔵[Fetch Request]',
    `[${getNowString()}]`,
    request?.method,
    url.href,
    !isBodyLoggingDisabled && request?.body ? JSON.stringify(request.body, null, 2) : ''
  );

  return requestArgs;
};

export const logResponseInterceptor: ResponseInterceptor = async (response, requestArgs) => {
  const url = new URL(requestArgs[0]);
  const request = requestArgs[1];
  const isSuccess = response.status > 0 && response.status < 400;

  if (process.env.VERCEL_ENV) {
    log(
      `${isSuccess ? '🟢' : '🔴'}[Fetch Response]`,
      `[${getNowString()}]`,
      request?.method,
      response.status,
      url.href,
      !isBodyLoggingDisabled && response.body ? JSON.stringify(response.body, null, 2) : ''
    );
  } else {
    log(
      `${BRIGHT}${isSuccess ? TEXT.GREEN : TEXT.RED}%s${RESET} ` +
        `${BRIGHT}${TEXT.MAGENTA}%s${RESET} ` +
        `${BRIGHT}${TEXT.YELLOW}%s${RESET} ` +
        `${BRIGHT}${isSuccess ? TEXT.GREEN : TEXT.RED}%s${RESET} ` +
        `${TEXT.CYAN}%s${RESET}\r\n${isBodyLoggingDisabled ? '' : `${TEXT.GRAY}%s${RESET}\r\n`}`,
      `${isSuccess ? '🟢' : '🔴'}[Fetch Response]`,
      `[${getNowString()}]`,
      request?.method,
      response.status,
      url.href,
      !isBodyLoggingDisabled && response.body ? JSON.stringify(response.body, null, 2) : ''
    );
  }

  return response;
};
