import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import api, { errMsg } from '../../services/api'
import RequestCard, { fmtDate } from '../../components/RequestCard'
import Spinner, { Empty, ErrorBox } from '../../components/Spinner'

const STATUSES = ['PENDING', 'ACTIVE', 'FULFILLED', 'CANCELLED', 'REJECTED', 'EXPIRED']

export default function AdminSection() {
  const { t, i18n } = useTranslation()
  const [stats, setStats] = useState(null)
  const [status, setStatus] = useState('PENDING')
  const [reqs, setReqs] = useState(null)
  const [users, setUsers] = useState(null)
  const [logs, setLogs] = useState([])
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      const [s, r, u, l] = await Promise.all([
        api.get('/api/admin/stats'), api.get('/api/admin/requests', { params: { status } }),
        api.get('/api/admin/users', { params: { size: 50 } }), api.get('/api/admin/logs')])
      setStats(s.data); setReqs(r.data); setUsers(u.data.items); setLogs(l.data)
    } catch (e) { setError(errMsg(e)) }
  }, [status])
  useEffect(() => { load() }, [load])

  const run = (p) => p.then(load).catch((e) => setError(errMsg(e)))
  const cards = stats && [
    [t('admin.users'), stats.users], [t('admin.donors'), stats.donors], [t('admin.activeDonors'), stats.activeDonors],
    [t('admin.requests'), stats.requests], [t('admin.activeReq'), stats.activeRequests],
    [t('admin.fulfilled'), stats.fulfilledRequests], [t('admin.pending'), stats.pendingRequests]]

  if (!stats && !error) return <Spinner />
  return (
    <>
      {error && <ErrorBox message={error} onRetry={load} />}
      {cards && (
        <section>
          <h2 className="text-xl font-bold">{t('admin.stats')}</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">{cards.map(([l, v]) => (
            <div key={l} className="card"><p className="text-2xl font-bold text-brand">{v}</p><p className="text-xs text-gray-600">{l}</p></div>))}</div>
        </section>
      )}

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">{t('admin.review')}</h2>
          <select aria-label={t('admin.filter')} className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => <option key={s} value={s}>{t(`enums.${s}`)}</option>)}
          </select>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {reqs?.length === 0 ? <div className="md:col-span-2"><Empty text={t('admin.noPending')} /></div> : reqs?.map((r) => (
            <RequestCard key={r.id} r={r}>
              {r.status === 'PENDING' && <>
                <button className="btn-primary !py-1.5" onClick={() => run(api.put(`/api/admin/requests/${r.id}/approve`))}>{t('admin.approve')}</button>
                <button className="btn-danger !py-1.5" onClick={() => run(api.put(`/api/admin/requests/${r.id}/reject`))}>{t('admin.reject')}</button>
              </>}
            </RequestCard>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold">{t('admin.users')}</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-mist"><tr><th className="p-3">{t('f.fullName')}</th><th className="p-3">{t('f.email')}</th><th className="p-3">Role</th><th className="p-3" /></tr></thead>
            <tbody>
              {users?.map((u) => (
                <tr key={u.id} className="border-t border-gray-100">
                  <td className="p-3">{u.fullName}</td><td className="p-3">{u.email}</td><td className="p-3">{u.role}</td>
                  <td className="flex flex-wrap justify-end gap-2 p-3">
                    {u.donorProfileId && <button className="btn-outline !py-1" onClick={() => run(api.put(`/api/admin/donors/${u.donorProfileId}/verify`, null, { params: { verified: !u.verified } }))}>{u.verified ? t('admin.unverify') : t('admin.verify')}</button>}
                    {u.role !== 'ADMIN' && <button className="btn-danger !py-1" onClick={() => run(api.put(`/api/admin/users/${u.id}/active`, { active: !u.active }))}>{u.active ? t('admin.suspend') : t('admin.reactivate')}</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold">{t('admin.logs')}</h2>
        <ul className="mt-3 divide-y divide-gray-100 rounded-xl border border-gray-200 text-sm">
          {logs.map((l) => <li key={l.id} className="p-3">{fmtDate(l.createdAt, i18n.language)} · {l.adminEmail} · {l.action} #{l.targetId}</li>)}
        </ul>
      </section>
    </>
  )
}
