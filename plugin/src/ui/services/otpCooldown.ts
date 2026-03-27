const OTP_RESEND_COOLDOWN_MS = 60_000;

let otpResendAvailableAt = 0;

export function startOtpResendCooldown() {
  otpResendAvailableAt = Date.now() + OTP_RESEND_COOLDOWN_MS;
}

export function getOtpResendCooldownSeconds() {
  const remainingMs = otpResendAvailableAt - Date.now();

  if (remainingMs <= 0) {
    return 0;
  }

  return Math.ceil(remainingMs / 1000);
}

export function resetOtpResendCooldown() {
  otpResendAvailableAt = 0;
}