import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import DonorSection from '../features/dashboard/DonorSection'
import AdminSection from '../features/dashboard/AdminSection'
import MyRequests from '../features/dashboard/MyRequests'
import Notifications from '../features/dashboard/Notifications'

export default function Dashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { state } = useLocation()

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold">{t('dash.welcome', { name: user.fullName })}</h1>
        <p className="mt-1 text-sm text-gray-600">{t('dash.emergency')}</p>
        {state?.notice && <p role="status" className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">{state.notice}</p>}
      </div>
      {user.role === 'ADMIN' && <AdminSection />}
      {user.role === 'DONOR' && <DonorSection />}
      {user.role !== 'ADMIN' && <MyRequests />}
      <Notifications />
    </div>
  )
}
