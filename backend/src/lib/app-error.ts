import { Response } from "express";

export type AppErrorCode =
  | "AUTH_REQUIRED"
  | "AUTH_INVALID"
  | "AUTH_INTERNAL_ERROR"
  | "INVALID_INPUT"
  | "NO_CREDITS"
  | "INVALID_PACKAGE"
  | "GENERATION_FAILED"
  | "BILLING_FAILED"
  | "WEBHOOK_INVALID"
  | "INTERNAL_ERROR"
  | "USER_NOT_FOUND";

export class AppError extends Error {
  code: AppErrorCode;
  status: number;
  detail?: string;

  constructor(input: {
    code: AppErrorCode;
    message: string;
    status: number;
    detail?: string;
  }) {
    super(input.message);
    this.name = "AppError";
    this.code = input.code;
    this.status = input.status;
    this.detail = input.detail;
  }
}

export function sendAppError(res: Response, error: AppError) {
  return res.status(error.status).json({
    error: error.code,
    message: error.message,
    ...(error.detail ? { detail: error.detail } : {}),
  });
}

export function toAppError(error: unknown, fallback?: Partial<AppError>) {
  if (error instanceof AppError) {
    return error;
  }

  const fallbackCode = fallback?.code ?? "INTERNAL_ERROR";
  const fallbackMessage = fallback?.message ?? "Ocorreu um erro interno.";
  const fallbackStatus = fallback?.status ?? 500;
  const fallbackDetail =
    error instanceof Error ? error.message : "Erro desconhecido";

  return new AppError({
    code: fallbackCode,
    message: fallbackMessage,
    status: fallbackStatus,
    detail: fallbackDetail,
  });
}

export function invalidInput(message: string, detail?: string) {
  return new AppError({
    code: "INVALID_INPUT",
    message,
    status: 400,
    detail,
  });
}

export function authRequired() {
  return new AppError({
    code: "AUTH_REQUIRED",
    message: "Autenticação obrigatória.",
    status: 401,
  });
}

export function authInvalid(detail?: string) {
  return new AppError({
    code: "AUTH_INVALID",
    message: "Sua sessão é inválida ou expirou.",
    status: 401,
    detail,
  });
}

export function authInternal(detail?: string) {
  return new AppError({
    code: "AUTH_INTERNAL_ERROR",
    message: "Erro interno ao validar autenticação.",
    status: 500,
    detail,
  });
}

export function noCredits() {
  return new AppError({
    code: "NO_CREDITS",
    message: "Você não tem créditos suficientes para concluir esta ação.",
    status: 402,
  });
}

export function invalidPackage(detail?: string) {
  return new AppError({
    code: "INVALID_PACKAGE",
    message: "O pacote selecionado é inválido.",
    status: 400,
    detail,
  });
}

export function generationFailed(detail?: string) {
  return new AppError({
    code: "GENERATION_FAILED",
    message: "Não foi possível gerar o carrossel.",
    status: 500,
    detail,
  });
}

export function billingFailed(detail?: string) {
  return new AppError({
    code: "BILLING_FAILED",
    message: "Não foi possível processar a operação de pagamento.",
    status: 500,
    detail,
  });
}

export function webhookInvalid(detail?: string) {
  return new AppError({
    code: "WEBHOOK_INVALID",
    message: "Webhook inválido.",
    status: 400,
    detail,
  });
}

export function userNotFound(detail?: string) {
  return new AppError({
    code: "USER_NOT_FOUND",
    message: "Usuário não encontrado.",
    status: 404,
    detail,
  });
}

export function internalError(detail?: string) {
  return new AppError({
    code: "INTERNAL_ERROR",
    message: "Ocorreu um erro interno.",
    status: 500,
    detail,
  });
}