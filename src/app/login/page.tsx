"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-canvas p-[24px]">
      <div className="w-full max-w-[360px] rounded-xl border border-border-subtle bg-surface-container-lowest p-[32px]">
        <h1 className="text-[24px] font-semibold leading-[32px] text-charcoal mb-[24px]">로그인</h1>

        <form action={action} className="flex flex-col gap-[16px]">
          <div className="flex flex-col gap-[4px]">
            <label htmlFor="username" className="text-[14px] font-medium leading-[20px] text-on-surface-variant">
              아이디
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoComplete="username"
              className="h-[40px] rounded-lg border border-border-subtle bg-surface-container-lowest px-[16px] text-[14px] text-on-surface outline-none focus:border-charcoal"
            />
          </div>

          <div className="flex flex-col gap-[4px]">
            <label htmlFor="password" className="text-[14px] font-medium leading-[20px] text-on-surface-variant">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="h-[40px] rounded-lg border border-border-subtle bg-surface-container-lowest px-[16px] text-[14px] text-on-surface outline-none focus:border-charcoal"
            />
          </div>

          {state?.error && (
            <p className="text-[14px] text-status-red">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-[8px] h-[40px] rounded-lg bg-primary text-[14px] font-medium text-on-primary transition-colors hover:bg-charcoal disabled:opacity-50"
          >
            {pending ? "로그인 중..." : "로그인"}
          </button>
        </form>
      </div>
    </div>
  );
}
