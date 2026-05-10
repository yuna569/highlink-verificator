import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = "noreply@mail.highlink.asia";

export async function sendApprovalEmail(
  to: string,
  name: string,
): Promise<void> {
  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "승인이 완료되었습니다",
    html: `
      <h1>안녕하세요, ${name}님!</h1>
      <p>인플루언서 승인이 완료되었습니다.</p>
      <p>감사합니다.</p>
    `,
  });
}
