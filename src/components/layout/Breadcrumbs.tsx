import { Link } from 'react-router-dom'

import './breadcrumbs.css'

export type Crumb = { label: string; to?: string }

export default function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li>
          <Link to="/">Home</Link>
        </li>
        {trail.map((crumb, index) => {
          const last = index === trail.length - 1
          return (
            <li key={crumb.label} aria-current={last ? 'page' : undefined}>
              {crumb.to && !last ? <Link to={crumb.to}>{crumb.label}</Link> : <span>{crumb.label}</span>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
