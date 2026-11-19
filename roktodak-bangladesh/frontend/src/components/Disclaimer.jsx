import { useTranslation } from 'react-i18next'
import { ShieldAlert } from 'lucide-react'

export default function Disclaimer() {
  const { t } = useTranslation()
  return (
    <div role="note" className="flex gap-3 rounded-xl border border-red-200 bg-brand-soft p-4 text-sm">
      <ShieldAlert className="mt-0.5 shrink-0 text-brand" size={20} />
      <p><strong>{t('legal.disclaimerTitle')}: </strong>{t('legal.disclaimer')}</p>
    </div>
  )
}
