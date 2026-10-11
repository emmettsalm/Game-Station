import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string
  error?: string
  hint?: ReactNode
}

/** ช่องกรอกข้อมูล + ข้อความ error ใต้ช่อง (ช่องรหัสผ่านมีปุ่มแสดง/ซ่อน) */
export default function FormField({ label, error, hint, type = 'text', className = '', ...inputProps }: FormFieldProps) {
  const id = useId()
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'

  return (
    <fieldset className="fieldset">
      <label htmlFor={id} className="fieldset-legend text-sm">{label}</label>
      <label className={`input w-full ${error ? 'input-error' : ''}`}>
        <input
          id={id}
          type={isPassword && show ? 'text' : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`grow ${className}`}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            className="text-xs opacity-60 hover:opacity-100"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
          >
            {show ? 'ซ่อน' : 'แสดง'}
          </button>
        )}
      </label>
      {error && <p id={`${id}-error`} className="text-error text-xs mt-1">{error}</p>}
      {hint}
    </fieldset>
  )
}
