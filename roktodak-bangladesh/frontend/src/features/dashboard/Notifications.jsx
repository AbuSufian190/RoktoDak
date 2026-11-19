import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api, { errMsg } from '../../services/api'
import Spinner, { ErrorBox } from '../../components/Spinner'
import { fmtDate } from '../../components/RequestCard'

export default function Notifications() {
  const { t, i18n } = useTranslation()
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    api.get('/api/notifications').then((r) => setItems(r.data)).catch((e) => setError(errMsg(e)))
  }, [])
  useEffect(load, [load])

  const read = (id) => api.put(`/api/notifications/${id}/read`).then(load).catch((e) => setError(errMsg(e)))

  return (
    <section>
      <h2 className="text-xl font-bold">{t('dash.notes')}</h2>
      <div className="mt-3 space-y-2">
        {error && <ErrorBox message={error} onRetry={load} />}
        {items === null && !error ? <Spinner /> : items?.length === 0 ? <p className="text-sm text-gray-600">{t('dash.noNotes')}</p>
          : items?.map((n) => (
            <div key={n.id} className={`card flex items-start justify-between gap-3 text-sm ${n.seen ? '' : 'border-brand bg-brand-soft'}`}>
              <div><p>{n.message}</p><p className="mt-1 text-xs text-gray-500">{fmtDate(n.createdAt, i18n.language)}</p></div>
              {!n.seen && <button className="btn-outline shrink-0 !py-1" onClick={() => read(n.id)}>{t('dash.markRead')}</button>}
            </div>
          ))}
      </div>
    </section>
  )
}
