import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { errMsg, fieldErrors } from '../services/api'
import { BLOOD_GROUPS } from '../data/bd'
import LocationSelect from '../components/LocationSelect'
import Disclaimer from '../components/Disclaimer'
import { ErrorBox } from '../components/Spinner'

const PHONE = /^(\+8801|01)[3-9]\d{8}$/

export default function Register() {
  const { t } = useTranslation()
  const { register: signUp } = useAuth()
  const nav = useNavigate()
  const [sp] = useSearchParams()
  const [role, setRole] = useState(sp.get('role') === 'DONOR' ? 'DONOR' : 'SEEKER')
  const [loc, setLoc] = useState({ division: '', district: '', upazila: '' })
  const [error, setError] = useState('')
  const [server, setServer] = useState({})
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { consentSearch: true } })
  const donor = role === 'DONOR'

  const onSubmit = async (v) => {
    setError(''); setServer({})
    if (donor && !v.consentSearch) { setError(t('auth.consentNeeded')); return }
    const body = {
      fullName: v.fullName, email: v.email, password: v.password, phone: v.phone, role,
      ...(donor && { bloodGroup: v.bloodGroup, ...loc, dateOfBirth: v.dateOfBirth || null, lastDonationDate: v.lastDonationDate || null, consentSearch: true }),
    }
    try { await signUp(body); nav('/dashboard', { replace: true }) } catch (e) { setError(errMsg(e)); setServer(fieldErrors(e)) }
  }

  const err = (n) => (errors[n]?.message || server[n]) && <p className="field-error">{errors[n]?.message || server[n]}</p>

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold">{t('auth.registerTitle')}</h1>
      <fieldset className="mt-4">
        <legend className="label">{t('auth.iam')}</legend>
        <div className="flex gap-2">
          {[['DONOR', 'auth.asDonor'], ['SEEKER', 'auth.asSeeker']].map(([r, k]) => (
            <button type="button" key={r} onClick={() => setRole(r)} aria-pressed={role === r}
              className={`btn flex-1 border ${role === r ? 'border-brand bg-brand-soft text-brand' : 'border-gray-300 bg-white'}`}>{t(k)}</button>
          ))}
        </div>
      </fieldset>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 grid gap-4 sm:grid-cols-2" noValidate>
        {error && <div className="sm:col-span-2"><ErrorBox message={error} /></div>}
        <div className="sm:col-span-2">
          <label className="label" htmlFor="fullName">{t('f.fullName')}</label>
          <input id="fullName" className="input" {...register('fullName', { required: t('f.fullName') })} />{err('fullName')}
        </div>
        <div>
          <label className="label" htmlFor="email">{t('f.email')}</label>
          <input id="email" type="email" autoComplete="email" className="input" {...register('email', { required: t('f.email') })} />{err('email')}
        </div>
        <div>
          <label className="label" htmlFor="phone">{t('f.phone')}</label>
          <input id="phone" inputMode="tel" className="input" {...register('phone', { required: t('f.phone'), pattern: { value: PHONE, message: t('f.phone') } })} />{err('phone')}
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="password">{t('f.password')}</label>
          <input id="password" type="password" autoComplete="new-password" className="input" {...register('password', { required: t('f.password'), minLength: { value: 8, message: t('f.password') } })} />{err('password')}
        </div>

        {donor && (
          <>
            <div>
              <label className="label" htmlFor="bloodGroup">{t('f.bloodGroup')}</label>
              <select id="bloodGroup" className="input" {...register('bloodGroup', { required: t('f.bloodGroup') })}>
                <option value="">{t('f.pick')}</option>
                {BLOOD_GROUPS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>{err('bloodGroup')}
            </div>
            <div>
              <label className="label" htmlFor="dob">{t('f.dob')}</label>
              <input id="dob" type="date" className="input" {...register('dateOfBirth')} />
            </div>
            <LocationSelect required withUpazila value={loc} onChange={setLoc} />
            <div>
              <label className="label" htmlFor="last">{t('f.last')}</label>
              <input id="last" type="date" className="input" {...register('lastDonationDate')} />
            </div>
            <label className="flex items-start gap-2 text-sm sm:col-span-2">
              <input type="checkbox" className="mt-1" {...register('consentSearch')} /> {t('f.consent')}
            </label>
            <div className="sm:col-span-2"><Disclaimer /></div>
          </>
        )}
        <button className="btn-primary sm:col-span-2" disabled={isSubmitting}>{t('nav.register')}</button>
      </form>
      <p className="mt-4 text-sm text-gray-600">{t('auth.have')} <Link className="font-medium text-brand" to="/login">{t('nav.login')}</Link></p>
    </div>
  )
}
