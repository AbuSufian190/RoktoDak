import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { errMsg } from '../services/api'
import { ErrorBox } from '../components/Spinner'

export default function Login() {
  const { t } = useTranslation()
  const { login } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const [error, setError] = useState('')

  const onSubmit = async (v) => {
    setError('')
    try { await login(v); nav(loc.state?.from || '/dashboard', { replace: true }) } catch (e) { setError(errMsg(e)) }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold">{t('auth.loginTitle')}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
        {error && <ErrorBox message={error} />}
        <div>
          <label className="label" htmlFor="email">{t('f.email')}</label>
          <input id="email" type="email" autoComplete="email" className="input" {...register('email', { required: true })} />
          {errors.email && <p className="field-error">{t('f.email')}</p>}
        </div>
        <div>
          <label className="label" htmlFor="password">{t('f.password')}</label>
          <input id="password" type="password" autoComplete="current-password" className="input" {...register('password', { required: true })} />
          {errors.password && <p className="field-error">{t('f.password')}</p>}
        </div>
        <button className="btn-primary w-full" disabled={isSubmitting}>{t('auth.loginTitle')}</button>
      </form>
      <p className="mt-4 text-sm text-gray-600">{t('auth.no')} <Link className="font-medium text-brand" to="/register">{t('nav.register')}</Link></p>
    </div>
  )
}
