# Resend 자체 도메인 설정 가이드

현재 `onboarding@resend.dev`(테스트 발신 주소)를 사용 중이며, 자체 도메인을 연결하면 누구에게든 메일을 보낼 수 있다.

## 1. Resend 대시보드에서 도메인 등록

1. https://resend.com/domains 접속
2. "Add Domain" 클릭
3. 사용할 도메인 입력 (예: `highlink.co.kr`)

## 2. DNS 레코드 설정

Resend가 아래 레코드들을 안내해준다. 도메인 관리 업체(가비아, Cloudflare 등)에서 추가.

| 구분 | 타입 | 호스트(Name) | 값(Value) | 우선순위 | TTL | 용도 |
|------|------|-------------|-----------|---------|-----|------|
| 필수 | **MX** | `send.highlink.co.kr` | `feedback-smtp.us-east-1.amazonses.com` | `10` | Auto | Resend(SES)를 통한 반송 메일 수신 |
| 필수 | **TXT** | `send.highlink.co.kr` | `v=spf1 include:amazonses.com ~all` | - | Auto | SPF — 서브도메인 발신 서버 선언 |
| 필수 | **TXT** | `highlink.co.kr` | `v=spf1 include:amazonses.com ~all` | - | Auto | SPF — 루트 도메인 발신 서버 선언 |
| 필수 | **TXT** | `resend._domainkey.highlink.co.kr` | 대시보드에서 발급된 공개키 | - | Auto | DKIM — 메일 서명 검증용 공개키 |
| 권장 | **TXT** | `_dmarc.highlink.co.kr` | `v=DMARC1; p=none;` | - | Auto | DMARC — SPF/DKIM 실패 시 처리 정책 |
| 선택 | **CNAME** | `links.highlink.co.kr` | `links1.r[...].dns.com` (대시보드 확인) | - | Auto | Tracking — 이메일 오픈/클릭 추적 |

> **참고**
> - 호스트 필드에 루트 도메인이 자동으로 붙는 DNS 업체(가비아 등)에서는 `highlink.co.kr` 부분을 생략해야 한다. 예: `send.highlink.co.kr` → `send`
> - DKIM TXT 레코드의 실제 값(공개키)은 Resend 대시보드에서 도메인 등록 후 확인할 수 있다.
> - DMARC 정책은 처음에 `p=none`(모니터링만)으로 시작하고, 안정화 후 `p=quarantine` 또는 `p=reject`로 변경하는 것을 권장한다.

## 3. Resend에서 인증 확인

- DNS 레코드 추가 후 Resend 대시보드에서 "Verify" 클릭
- 전파에 최대 48시간 걸릴 수 있으나 보통 수 분 내 완료

## 4. 코드 변경

`src/lib/email.ts`에서 `FROM_ADDRESS`를 변경:

```ts
// 변경 전
const FROM_ADDRESS = "onboarding@resend.dev";

// 변경 후
const FROM_ADDRESS = "noreply@highlink.co.kr"; // 원하는 주소
```

## 5. 수신 대상 제한 해제

도메인 인증이 완료되면 `APPROVAL_NOTIFY_EMAIL`을 본인 이메일이 아닌 다른 주소로도 설정할 수 있고, 인플루언서 본인 이메일로 직접 발송하는 것도 가능해진다.
