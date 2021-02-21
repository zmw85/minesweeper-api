import expressWinston from "express-winston";
import winston, { createLogger, format, transports } from "winston";

const { combine, timestamp, label, json, colorize } = format;
const { Console } = transports;

export const expressLogger = expressWinston.logger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  ),
  meta: true,
  msg: "HTTP {{req.method}} {{req.url}}",
  expressFormat: true,
  colorize: false,
  ignoreRoute: function (req, res) {
    return false;
  },
});

export const consoleLogger = createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  format: combine(
    timestamp(),
    label({
      label: "minesweeper-api",
    }),
    json(),
    colorize()
  ),
  transports: [new Console()],
  exitOnError: false,
});
