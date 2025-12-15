// src/shared/logger/index.ts
import { createLogger, format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const { combine, timestamp, label, printf } = format;
const isProduction = process.env.NODE_ENV === 'production';

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const infoLogger = createLogger({
  level: 'info',
  format: combine(label({ label: 'app' }), timestamp(), myFormat),
  transports: isProduction
    ? [
        new DailyRotateFile({
          filename: path.join(
            process.cwd(),
            'logs',
            'winston',
            'successes',
            'day-%DATE%-success.log'
          ),
          datePattern: 'YYYY-MM-DD-HH',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ]
    : [],
});

const errorLogger = createLogger({
  level: 'error',
  format: combine(label({ label: 'app' }), timestamp(), myFormat),
  transports: isProduction
    ? [
        new DailyRotateFile({
          filename: path.join(
            process.cwd(),
            'logs',
            'winston',
            'errors',
            'day-%DATE%-error.log'
          ),
          datePattern: 'YYYY-MM-DD-HH',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
        }),
      ]
    : [],
});

// helper functions
export const logInfo = (message: string) => {
  if (isProduction) {
    infoLogger.info(message);
  } else {
    console.log(`INFO: ${message}`);
  }
};

export const logError = (message: string, error?: unknown) => {
  if (isProduction) {
    errorLogger.error(`${message} ${error ? JSON.stringify(error) : ''}`);
  } else {
    console.error(`ERROR: ${message}`, error || '');
  }
};
