import type { ChangeEvent } from 'react'

type Props = {
  password: string
  confirm: string
  onPasswordChange: (v: string) => void
  onConfirmChange: (v: string) => void
  passwordLabel?: string
  confirmLabel?: string
}

/** 숫자 6자리 비밀번호 + 확인 입력 */
export function SixDigitPasswordFields({
  password,
  confirm,
  onPasswordChange,
  onConfirmChange,
  passwordLabel = '비밀번호 (숫자 6자리)',
  confirmLabel = '비밀번호 확인',
}: Props) {
  const inputClass =
    'mt-1.5 w-full rounded-xl border border-stone-200 px-4 py-3 text-center font-mono text-xl tracking-[0.35em] text-stone-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200'

  const onDigit = (setter: (v: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value.replace(/\D/g, '').slice(0, 6))
  }

  return (
    <>
      <label className="block text-sm font-medium text-stone-700">
        {passwordLabel}
        <input
          type="password"
          inputMode="numeric"
          pattern="\d*"
          maxLength={6}
          value={password}
          onChange={onDigit(onPasswordChange)}
          autoComplete="new-password"
          className={inputClass}
          placeholder="••••••"
        />
      </label>
      <label className="mt-4 block text-sm font-medium text-stone-700">
        {confirmLabel}
        <input
          type="password"
          inputMode="numeric"
          pattern="\d*"
          maxLength={6}
          value={confirm}
          onChange={onDigit(onConfirmChange)}
          autoComplete="new-password"
          className={inputClass}
          placeholder="••••••"
        />
      </label>
    </>
  )
}
