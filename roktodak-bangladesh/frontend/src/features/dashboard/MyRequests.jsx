import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api, { errMsg } from '../../services/api'
import RequestCard from '../../components/RequestCard'
import ConfirmModal from '../../components/ConfirmModal'
import { Empty, ErrorBox, Skeletons } from '../../components/Spinner'
import { bloodLabel } from '../../data/bd'

const OPEN = ['PENDING', 'APPROVED', 'ACTIVE', 'PARTIALLY_FULFILLED']

export default function MyRequests() {
  const { t } = useTranslation()
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState(null)
  const [open, setOpen] = useState(null)
  const [resp, setResp] = useState([])

  const load = useCallback(() => {
    api.get('/api/requests/mine').then((r) => setItems(r.data)).catch((e) => setError(errMsg(e)))
  }, [])
  useEffect(load, [load])

  const act = (id, action) => api.put(`/api/requests/${id}/${action}`).then(load).catch((e) => setError(errMsg(e)))
  const showResponses = async (id) => {
    if (open === id) { setOpen(null); return }
    try { setResp((await api.get(`/api/requests/${id}/responses`)).data); setOpen(id) } catch (e) { setError(errMsg(e)) }
  }

  const stats = items && [
    [t('dash.total'), items.length],
    [t('dash.active'), items.filter((r) => ['ACTIVE', 'PARTIALLY_FULFILLED'].includes(r.status)).length],
    [t('dash.done'), items.filter((r) => r.status === 'FULFILLED').length],
  ]

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('req.mine')}</h2>
        <Link to="/requests/new" className="btn-primary">{t('req.new')}</Link>
      </div>
      {error && <div className="mt-3"><ErrorBox message={error} onRetry={load} /></div>}
      {stats && <div className="mt-3 grid grid-cols-3 gap-3">{stats.map(([l, v]) => (
        <div key={l} className="card text-center"><p className="text-2xl font-bold text-brand">{v}</p><p className="text-xs text-gray-600">{l}</p></div>))}</div>}
      <div className="mt-4 space-y-3">
        {items === null && !error ? <Skeletons n={2} /> : items?.length === 0 ? <Empty text={t('dash.noReq')} /> : items?.map((r) => (
          <div key={r.id}>
            <RequestCard r={r}>
              {['ACTIVE', 'PARTIALLY_FULFILLED'].includes(r.status) && <button className="btn-primary !py-1.5" onClick={() => setConfirm({ text: t('req.confirmFulfill'), fn: () => act(r.id, 'fulfill') })}>{t('req.fulfill')}</button>}
              {OPEN.includes(r.status) && <button className="btn-danger !py-1.5" onClick={() => setConfirm({ text: t('req.confirmCancel'), fn: () => act(r.id, 'cancel') })}>{t('req.cancel')}</button>}
              <button className="btn-outline !py-1.5" onClick={() => showResponses(r.id)}>{t('req.responses')}</button>
            </RequestCard>
            {open === r.id && (
              <div className="mt-1 rounded-xl bg-mist p-3 text-sm">
                {resp.length === 0 ? t('req.noResp') : resp.map((x) => (
                  <p key={x.id} className="py-1">
                    {x.donorName} ({bloodLabel(x.bloodGroup)}) · {t(`enums.${x.status}`)}
                    {x.donorPhone && <> · <a className="font-medium text-brand" href={`tel:${x.donorPhone}`}>{x.donorPhone}</a></>}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <ConfirmModal text={confirm?.text} onConfirm={() => confirm.fn()} onClose={() => setConfirm(null)} />
    </section>
  )
}
