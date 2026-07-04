const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const activeLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug");

const shouldLog = (level) => levels[level] <= levels[activeLevel];

const formatMeta = (meta) => {
  if (!meta) return "";
  if (meta instanceof Error) return ` ${meta.stack || meta.message}`;
  if (typeof meta === "string") return ` ${meta}`;
  return ` ${JSON.stringify(meta)}`;
};

export const logger = {
  error(message, meta) {
    if (shouldLog("error")) console.error(`[error] ${message}${formatMeta(meta)}`);
  },
  warn(message, meta) {
    if (shouldLog("warn")) console.warn(`[warn] ${message}${formatMeta(meta)}`);
  },
  info(message, meta) {
    if (shouldLog("info")) console.info(`[info] ${message}${formatMeta(meta)}`);
  },
  debug(message, meta) {
    if (shouldLog("debug")) console.debug(`[debug] ${message}${formatMeta(meta)}`);
  }
};
