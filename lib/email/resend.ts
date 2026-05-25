import { Resend } from "resend";

let _client: Resend | null = null;

function client(): Resend {
  if (_client) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  _client = new Resend(key);
  return _client;
}

const FROM = process.env.RESEND_FROM_EMAIL || "Bhuk Foods <hello@bhukfoods.com>";

export async function sendMail(args: {
  to: string | string[];
  subject: string;
  text: string;
  bcc?: string | string[];
  cc?: string | string[];
  reply_to?: string;
  attachments?: Array<{ filename: string; content: Buffer | string; contentType?: string }>;
}) {
  const resend = client();
  const r = await resend.emails.send({
    from: FROM,
    to: Array.isArray(args.to) ? args.to : [args.to],
    subject: args.subject,
    text: args.text,
    bcc: args.bcc,
    cc: args.cc,
    replyTo: args.reply_to,
    attachments: args.attachments,
  });
  if (r.error) {
    throw new Error(`Resend send failed: ${r.error.message}`);
  }
  return r.data;
}
