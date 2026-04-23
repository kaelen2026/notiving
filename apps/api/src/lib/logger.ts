type LogData = Record<string, unknown>;

interface LoggerInstance {
  info(data: LogData, msg?: string): void;
  error(data: LogData, msg?: string): void;
  warn(data: LogData, msg?: string): void;
  debug(data: LogData, msg?: string): void;
  child(bindings: LogData): LoggerInstance;
}

function createLogger(bindings: LogData = {}): LoggerInstance {
  const fmt = (level: string, data: LogData, msg?: string) => {
    const merged = { ...bindings, ...data };
    const parts = [new Date().toISOString(), level.toUpperCase()];
    if (msg) parts.push(msg);
    return [parts.join(" "), Object.keys(merged).length > 0 ? merged : undefined];
  };

  return {
    info(data, msg) { console.log(...fmt("info", data, msg)); },
    error(data, msg) { console.error(...fmt("error", data, msg)); },
    warn(data, msg) { console.warn(...fmt("warn", data, msg)); },
    debug(data, msg) { console.debug(...fmt("debug", data, msg)); },
    child(extra) { return createLogger({ ...bindings, ...extra }); },
  };
}

export type { LoggerInstance };
export const logger = createLogger();
