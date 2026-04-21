import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export const FROM = process.env.RESEND_FROM_EMAIL ?? "The Playground @niederwald <info@playgroundniederwald.com>";
export const NOTIFY_EMAIL = process.env.RESEND_NOTIFY_EMAIL ?? "info@playgroundniederwald.com";
