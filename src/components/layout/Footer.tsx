import { Link } from 'react-router-dom'

import { logo } from '@/lib/assets'
import { company, divisions, legalNav, primaryNav } from '@/lib/site'

import './footer.css'

/* Evaluated once at module load rather than on every render. */
const YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="site-footer u-on-dark">
      <div className="u-container">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <picture className="site-footer__mark">
              <source srcSet={logo.webp} type="image/webp" />
              <img src={logo.jpg} alt={logo.alt} width={logo.width} height={logo.height} />
            </picture>
            <p className="site-footer__tagline">{company.tagline}</p>
            <p className="site-footer__blurb">
              A real estate marketing and digital growth company working with property projects
              and businesses across {company.location}.
            </p>
          </div>

          {/* Both divisions sit at the same level in the footer, as they do in the nav. */}
          <nav className="site-footer__col" aria-label="Divisions">
            <h2 className="site-footer__heading">Divisions</h2>
            <ul>
              {divisions.map(division => (
                <li key={division.id}>
                  <Link to={division.to}>{division.name}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="site-footer__col" aria-label="Footer">
            <h2 className="site-footer__heading">Company</h2>
            <ul>
              {primaryNav
                .filter(item => !divisions.some(division => division.to === item.to))
                .map(item => (
                  <li key={item.to}>
                    <Link to={item.to}>{item.label}</Link>
                  </li>
                ))}
            </ul>
          </nav>

          <div className="site-footer__col">
            <h2 className="site-footer__heading">Contact</h2>
            <ul>
              <li>
                <a href={`mailto:${company.email}`}>{company.email}</a>
              </li>
              <li>
                <a href={company.phoneHref}>{company.phone}</a>
              </li>
              <li>
                <a href={company.whatsappHref} target="_blank" rel="noreferrer noopener">
                  WhatsApp
                </a>
              </li>
              <li className="site-footer__plain">{company.location}</li>
            </ul>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>
            &copy; {YEAR} {company.name}. All rights reserved.
          </p>
          <ul className="site-footer__legal">
            {legalNav.map(item => (
              <li key={item.to}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
