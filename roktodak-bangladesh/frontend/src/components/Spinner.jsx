import { useTranslation } from 'react-i18next'

export default function Spinner() {
  const { t } = useTranslation()
  return <p role="status" className="py-10 text-center text-sm text-gray-500">{t('c.loading')}</p>
}

export function Skeletons({ n = 3 }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: n }).map((_, i) => <div key={i} className="card h-28 animate-pulse bg-gray-100" />)}
    </div>
  )
}

export function ErrorBox({ message, onRetry }) {
  const { t } = useTranslation()
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-brand-soft p-4 text-sm text-brand">
      {message}
      {onRetry && <button className="ml-3 underline" onClick={onRetry}>{t('c.retry')}</button>}
    </div>
  )
}

export function Empty({ text, children }) {
  return <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-600"><p>{text}</p>{children}</div>
}
