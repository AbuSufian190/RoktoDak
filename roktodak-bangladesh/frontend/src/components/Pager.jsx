import { useTranslation } from 'react-i18next'

export default function Pager({ page, totalPages, onChange }) {
  const { t } = useTranslation()
  if (totalPages <= 1) return null
  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <button className="btn-outline" disabled={page === 0} onClick={() => onChange(page - 1)}>{t('c.prev')}</button>
      <span className="text-sm text-gray-600">{t('c.page', { n: page + 1, t: totalPages })}</span>
      <button className="btn-outline" disabled={page + 1 >= totalPages} onClick={() => onChange(page + 1)}>{t('c.next')}</button>
    </div>
  )
}
