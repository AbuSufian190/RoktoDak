import { useTranslation } from 'react-i18next'
import { Building2, Clock, MapPin } from 'lucide-react'
import { bloodLabel } from '../data/bd'

const tone = { CRITICAL: 'bg-brand text-white', HIGH: 'bg-brand-soft text-brand', MEDIUM: 'bg-amber-50 text-amber-800', LOW: 'bg-gray-100 text-gray-700' }

export const fmtDate = (s, lng) => new Date(s).toLocaleString(lng === 'bn' ? 'bn-BD' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' })

export default function RequestCard({ r, children }) {
  const { t, i18n } = useTranslation()
  return (
    <article className="card">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand text-lg font-bold text-white">{bloodLabel(r.bloodGroup)}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tone[r.urgency]}`}>{t(`enums.${r.urgency}`)}</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium">{t(`enums.${r.status}`)}</span>
            <span className="text-xs text-gray-500">{r.units} {t('c.units')}</span>
          </div>
          <h3 className="mt-1.5 flex items-center gap-1.5 font-semibold"><Building2 size={15} />{r.hospitalName}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-600"><MapPin size={14} />{[r.upazila, r.district].filter(Boolean).join(', ')}</p>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-600"><Clock size={14} />{t('c.required')}: {fmtDate(r.requiredAt, i18n.language)}</p>
          {r.patientName && <p className="mt-0.5 text-sm text-gray-600">{t('req.patient')}: {r.patientName}</p>}
          {r.contactPhone && <p className="mt-0.5 text-sm font-medium">{t('req.contact')}: <a className="text-brand" href={`tel:${r.contactPhone}`}>{r.contactPhone}</a></p>}
        </div>
      </div>
      {children && <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">{children}</div>}
    </article>
  )
}
