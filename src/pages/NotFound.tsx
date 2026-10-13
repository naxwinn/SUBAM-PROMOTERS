import { Link } from 'react-router-dom'

import Button from '@/components/ui/Button'
import { useSeo } from '@/lib/seo'
import { divisions, primaryNav } from '@/lib/site'

import './not-found.css'

export default function NotFound() {
  useSeo({
    title: 'Page not found',
    description: 'That page does not exist. Find what you were looking for from here.',
    path: '/404/',
  })

  return (
    <section className="notfound u-on-dark">
      <div className="u-container notfound__inner">
        <p className="notfound__code">404</p>
        <h1 className="notfound__title">That page does not exist.</h1>
        <p className="notfound__lede">
          The link may be out of date, or the address may have a typo in it. Everything on the site
          is reachable from here.
        </p>

        <div className="notfound__actions">
          <Button to="/" variant="gold" size="lg">
            Back to home
          </Button>
          <Button to="/contact/" variant="secondary" size="lg">
            Discuss Your Project
          </Button>
        </div>

        <div className="notfound__links">
          <div>
            <h2>Divisions</h2>
            <ul>
              {divisions.map(division => (
                <li key={division.id}>
                  <Link to={division.to}>{division.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Pages</h2>
            <ul>
              {primaryNav.map(item => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
