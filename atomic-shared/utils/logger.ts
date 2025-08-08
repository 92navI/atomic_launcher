import winston from 'winston';
import { logLevel } from './config.js';
import * as p from 'path';
import { app } from 'electron';

const { combine, timestamp, printf, colorize } = winston.format;

// Define custom log format
const logFormat = printf(({ level, message, timestamp, label }) => {
  if (label == undefined) label = 'default';
  return `${timestamp} [${label}] [${level}]: ${message}`;
});

const logFile = p.join(app.getPath('userData'), 'launch.log');

const logger = winston.createLogger({
  level: logLevel,
  transports: [
    new winston.transports.File({
      filename: logFile,
      format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
    }),
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    }),
  ],
  exitOnError: false,
});

export default logger;
