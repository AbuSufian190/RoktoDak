import { useTranslation } from 'react-i18next'

export default function ConfirmModal({ text, onConfirm, onClose }) {
  const { t } = useTranslation()
  if (!text) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-xl bg-white p-5">
        <p className="text-sm">{text}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn-outline" onClick={onClose}>{t('c.no')}</button>
          <button className="btn-primary" onClick={() => { onConfirm(); onClose() }}>{t('c.yes')}</button>
        </div>
      </div>
    </div>
  )
}
