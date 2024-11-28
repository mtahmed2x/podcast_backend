import path from "path";
import { createLogger, format, transports } from "winston";
const DailyRotateFile = require("winston-daily-rotate-file");

const { combine, timestamp, label, printf, colorize } = format;

// Custom log format with colorization
const myFormat = printf(({ level, message, label, timestamp }) => {
  const date = new Date(timestamp as string);
  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();

  return `${date.toDateString()} ${h}:${m}:${s} [${label}] ${level}: ${message}`;
});

// Set log directory path
const logDir = path.join(process.cwd(), "logs", "winston");

// Main logger with colorization for all sections
export const logger = createLogger({
  level: "info",
  format: combine(
    label({ label: "PodCast" }),
    timestamp(),
    colorize(), // Apply colorization to the entire log
    myFormat
  ),
  transports: [
    // Console transport (colored logs for all sections)
    new transports.Console({
      format: combine(
        colorize(), // Apply colorization to all log sections in console
        myFormat // Use custom format for the console
      ),
    }),

    // File transport for successes
    new transports.File({
      level: "info",
      filename: path.join(logDir, "successes", "um-success.log"),
    }),

    // Daily rotate file transport for successes
    new DailyRotateFile({
      level: "info",
      filename: path.join(logDir, "successes", "um-%DATE%-success.log"),
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

// Error logger with colorization for all sections
export const errorLogger = createLogger({
  level: "error",
  format: combine(
    label({ label: "PodCast" }),
    timestamp(),
    colorize(), // Apply colorization to the entire log
    myFormat
  ),
  transports: [
    // Console transport (colored logs for all sections)
    new transports.Console({
      format: combine(
        colorize(), // Apply colorization to all log sections in console
        myFormat // Use custom format for the console
      ),
    }),

    // Daily rotate file transport for errors
    new DailyRotateFile({
      level: "error",
      filename: path.join(logDir, "errors", "um-%DATE%-error.log"),
      datePattern: "YYYY-MM-DD-HH",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});
