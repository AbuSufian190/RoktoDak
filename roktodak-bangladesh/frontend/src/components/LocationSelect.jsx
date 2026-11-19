import { useTranslation } from 'react-i18next'
import { DIVISIONS } from '../data/bd'

// Controlled division + district (+ optional upazila text) selector.
export default function LocationSelect({ value, onChange, withUpazila = false, required = false, allowAll = false }) {
  const { t } = useTranslation()
  const { division = '', district = '', upazila = '' } = value
  const districts = division ? DIVISIONS[division] : []
  const empty = allowAll ? t('c.all') : t('f.pick')
  return (
    <>
      <div>
        <label className="label" htmlFor="division">{t('f.division')}</label>
        <select id="division" className="input" required={required} value={division}
          onChange={(e) => onChange({ division: e.target.value, district: '', upazila: '' })}>
          <option value="">{empty}</option>
          {Object.keys(DIVISIONS).map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="district">{t('f.district')}</label>
        <select id="district" className="input" required={required} value={district} disabled={!division}
          onChange={(e) => onChange({ ...value, district: e.target.value })}>
          <option value="">{empty}</option>
          {districts.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>
      {withUpazila && (
        <div>
          <label className="label" htmlFor="upazila">{t('f.upazila')}</label>
          <input id="upazila" className="input" value={upazila} maxLength={60}
            onChange={(e) => onChange({ ...value, upazila: e.target.value })} />
        </div>
      )}
    </>
  )
}
