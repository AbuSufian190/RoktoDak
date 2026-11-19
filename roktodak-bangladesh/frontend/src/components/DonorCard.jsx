import { useTranslation } from 'react-i18next'
import { BadgeCheck, MapPin } from 'lucide-react'
import { bloodLabel } from '../data/bd'

export default function DonorCard({ d }) {
  const { t } = useTranslation()
  return (
    <article className="card flex gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand text-lg font-bold text-white" aria-label={t('f.bloodGroup')}>
        {bloodLabel(d.bloodGroup)}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="flex items-center gap-1.5 font-semibold">
          {d.displayName}
          {d.verified && <BadgeCheck size={16} className="text-brand" aria-label={t('c.verified')} />}
        </h3>
        <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-600"><MapPin size={14} />{[d.upazila, d.district].filter(Boolean).join(', ')}</p>
        <p className={`mt-1 text-xs font-medium ${d.available ? 'text-green-700' : 'text-gray-500'}`}>{d.available ? t('c.available') : t('c.unavailable')}</p>
        {d.lastDonationDate && <p className="text-xs text-gray-500">{t('f.last')}: {d.lastDonationDate}</p>}
      </div>
    </article>
  )
}
