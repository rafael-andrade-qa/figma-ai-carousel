type LogLevel = "info" | "warn" | "error";

type LogContext = Record<string, unknown>;

function toSerializableError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return error;
}

function baseLog(level: LogLevel, message: string, context?: LogContext) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context ? { context } : {}),
  };

  const serialized = JSON.stringify(payload);

  if (level === "error") {
    console.error(serialized);
    return;
  }

  if (level === "warn") {
    console.warn(serialized);
    return;
  }

  console.log(serialized);
}

export function logInfo(message: string, context?: LogContext) {
  baseLog("info", message, context);
}

export function logWarn(message: string, context?: LogContext) {
  baseLog("warn", message, context);
}

export function logError(
  message: string,
  error?: unknown,
  context?: LogContext
) {
  baseLog("error", message, {
    ...(context ?? {}),
    ...(error !== undefined ? { error: toSerializableError(error) } : {}),
  });
} 