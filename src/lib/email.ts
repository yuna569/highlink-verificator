import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = "noreply@mail.highlink.asia";
const SIGNUP_BASE_URL = "https://highlink.asia/signup";

export async function sendBusinessApprovalEmail(to: string, code: string): Promise<void> {
  const ctaUrl = `${SIGNUP_BASE_URL}?code=${code}`;
  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "[HighLink] 사업자님을 위한 크리에이터 모집을 시작하였습니다!",
    html: `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

          <!-- 로고 헤더 -->
          <tr>
            <td style="padding:32px 40px 24px;">
              <div style="font-size:26px;font-weight:700;letter-spacing:-0.5px;color:#222;">HighLink</div>
            </td>
          </tr>

          <!-- 구분선 -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:linear-gradient(90deg,#8A4DFF 0%,#4C7CFF 55%,#22B8F5 100%);border-radius:2px;"></div>
            </td>
          </tr>

          <!-- 본문 -->
          <tr>
            <td style="padding:32px 40px;font-size:15px;line-height:1.8;color:#222222;">

              <p style="margin:0 0 8px;">안녕하세요, 대표님.</p>
              <p style="margin:0 0 24px;">HighLink 파트너십 매니저 김영준입니다.</p>

              <p style="margin:0 0 24px;">
                현재 대표님께서 요청해 주신 정보를 바탕으로 크리에이터 선정을 완료하였습니다. 해당 크리에이터 리스트는 아래 버튼을 통해 확인하실 수 있습니다.
              </p>

             

              <p style="margin:0 0 24px;">
                앞으로 대표님의 브랜드 성장과 성과 향상을 위해 최선을 다하겠습니다.
              </p>

              

              <p style="margin:0 0 4px;">감사합니다.</p>
              <p style="margin:0;">HighLink 파트너십 매니저 김영준 드림</p>
              
              <br>
              <br>

              <!-- CTA 버튼 -->
              <table style="margin:8px auto 32px;" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-radius:8px;background:linear-gradient(90deg,#8A4DFF 0%,#4C7CFF 55%,#22B8F5 100%);" align="center">
                    <a href="${ctaUrl}" target="_blank"
                      style="display:inline-block;padding:15px 36px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;letter-spacing:-0.2px;">
                      크리에이터 확인하기
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- 푸터 -->
          <tr>
            <td style="padding:20px 40px;background-color:#f9f9f9;border-top:1px solid #eeeeee;font-size:12px;color:#aaaaaa;line-height:1.6;">
              본 메일은 발신 전용입니다. 문의사항은 HighLink 고객센터를 이용해 주세요.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  });
}

export async function sendApprovalEmail(to: string, code: string): Promise<void> {
  const ctaUrl = `${SIGNUP_BASE_URL}?code=${code}`;
  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: "[HighLink] 크리에이터 승인이 완료되었습니다 🎉",
    html: `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

          <!-- 로고 헤더 -->
          <tr>
            <td style="padding:32px 40px 24px;">
              <div style="font-size:26px;font-weight:700;letter-spacing:-0.5px;color:#222;">HighLink</div>
            </td>
          </tr>

          <!-- 구분선 -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:linear-gradient(90deg,#8A4DFF 0%,#4C7CFF 55%,#22B8F5 100%);border-radius:2px;"></div>
            </td>
          </tr>

          <!-- 본문 -->
          <tr>
            <td style="padding:32px 40px;font-size:15px;line-height:1.8;color:#222222;">

              <p style="margin:0 0 8px;">안녕하세요, 크리에이터님.</p>
              <p style="margin:0 0 24px;">HighLink 파트너십 매니저 김영준입니다.</p>

              <p style="margin:0 0 24px;">
                먼저 HighLink의 크리에이터로 신청해 주셔서 진심으로 감사드립니다.<br>
                뛰어난 역량을 갖추신 크리에이터님과 앞으로 멋진 협업을 함께할 수 있게 되어 무척 기쁘게 생각합니다.
              </p>

              
              <p style="margin:0 0 24px;color:#444444;">
                아래 버튼을 통해 회원가입을 완료해 주시면 크리에이터님을 위한 최적의 협찬 정보를 제공해 드리겠습니다.
              </p>

              

              <p style="margin:0 0 4px;">감사합니다.</p>
              <p style="margin:0;">HighLink 파트너십 매니저 김영준 드림</p>

              <br>
              <br>

              <!-- CTA 버튼 -->
              <table style="margin:8px auto 32px;" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-radius:8px;background:linear-gradient(90deg,#8A4DFF 0%,#4C7CFF 55%,#22B8F5 100%);" align="center">
                    <a href="${ctaUrl}" target="_blank"
                      style="display:inline-block;padding:15px 36px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;letter-spacing:-0.2px;">
                      매칭 시작하기
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- 푸터 -->
          <tr>
            <td style="padding:20px 40px;background-color:#f9f9f9;border-top:1px solid #eeeeee;font-size:12px;color:#aaaaaa;line-height:1.6;">
              본 메일은 발신 전용입니다. 문의사항은 HighLink 고객센터를 이용해 주세요.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  });
}
