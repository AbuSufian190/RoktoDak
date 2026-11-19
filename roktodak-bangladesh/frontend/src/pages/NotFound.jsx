import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-5xl font-bold text-brand">404</p>
      <Link to="/" className="btn-primary mt-6">Home</Link>
    </div>
  )
}
