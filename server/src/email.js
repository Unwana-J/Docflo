import { config } from "./config.js";
import { v4 as uuidv4 } from "uuid";

// Simple abstraction so we can swap email providers later.
// For now, we log emails in dev and provide Resend as an example.

async function sendViaConsole(to, subject, html) {
  console.log("=== Email (console provider) ===");
  console.log("To:", to);
  console.log("Subject:", subject);
  console.log("HTML:", html);
  console.log("================================");
}

export async function sendEmail(to, subject, html) {
  if (config.emailProvider === "console" || !config.resendApiKey) {
    return sendViaConsole(to, subject, html);
  }

  // Placeholder for a real provider like Resend.
  // You can replace this with an actual API call using fetch or axios.
  return sendViaConsole(to, subject, html);
}

export function buildInviteEmail(token, teamName) {
  const url = `${config.frontendBaseUrl}/accept-invite?token=${encodeURIComponent(
    token
  )}`;
  return {
    subject: `You've been invited to ${teamName} on DocuFlow AI`,
    html: `
      <p>You have been invited to join <strong>${teamName}</strong> on DocuFlow AI.</p>
      <p>Click the button below to accept your invite. This link expires in 7 days.</p>
      <p><a href="${url}" style="display:inline-block;padding:10px 16px;background:#111827;color:#ffffff;border-radius:999px;text-decoration:none;">Accept Invitation</a></p>
      <p>Or open this link in your browser:<br/>${url}</p>
    `,
  };
}

export function buildMagicLoginEmail(token) {
  const url = `${config.frontendBaseUrl}/magic-login?token=${encodeURIComponent(
    token
  )}`;
  return {
    subject: "Your DocuFlow AI sign-in link",
    html: `
      <p>Click the button below to sign in. This link expires in 15 minutes.</p>
      <p><a href="${url}" style="display:inline-block;padding:10px 16px;background:#111827;color:#ffffff;border-radius:999px;text-decoration:none;">Sign In</a></p>
      <p>Or open this link in your browser:<br/>${url}</p>
    `,
  };
}

