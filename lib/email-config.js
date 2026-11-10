export function emailConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY || process.env.RESEND_API_kEY,
    from: process.env.RESEND_FROM_EMAIL
  };
}
