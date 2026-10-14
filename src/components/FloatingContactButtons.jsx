import { FaInstagram, FaPhoneAlt, FaWhatsapp } from 'react-icons/fa'

import './FloatingContactButtons.css'

/* ===========================================================================
   CONFIGURATION — edit the two numbers below before deployment.

   Format: country code first, DIGITS ONLY. No '+', no spaces, no dashes.
     India  +91 7603 976 398   ->  '917603976398'

   Leave a value as an empty string ('') to disable that button. It then
   renders greyed out and non-interactive instead of producing a broken link.
   The two values are independent: they may be the same number or different.

   Keep these in step with `company` in src/lib/site.ts, which supplies the
   same details to the footer, contact page, enquiry form and final CTA.
   =========================================================================== */

/** WhatsApp Click to Chat target. https://faq.whatsapp.com/5913398998672934 */
const WHATSAPP_NUMBER = '917603976398'

/** Phone dialler target for the tel: link. */
const CALL_PHONE_NUMBER = '917603976398'

/** Pre-filled WhatsApp message. URL-encoded below. */
const WHATSAPP_MESSAGE = "Hi SUBAM PROMOTERS, I'm interested in your services."

/** Instagram profile. Used exactly as supplied. */
const INSTAGRAM_URL = 'https://instagram.com/subampromoters?obrf=amk4MjNtamJjMXl0'

/* ========================= end of configuration ========================== */

/** Guards against a number that is blank or contains anything but digits. */
const isUsable = value => /^\d{6,15}$/.test(String(value ?? '').trim())

const buildWhatsAppUrl = (number, message) =>
  `https://wa.me/${number}?text=${encodeURIComponent(message)}`

/* tel: takes E.164, which is the digits with a leading '+'. The stored value
   stays plain digits because that is what wa.me requires. */
const buildTelUrl = number => `tel:+${number}`

/* Bottom-left column: phone on top, WhatsApp directly beneath it. */
const LEFT_CONTACTS = [
  {
    id: 'phone',
    label: 'Call Us',
    ariaLabel: 'Call SUBAM PROMOTERS',
    href: isUsable(CALL_PHONE_NUMBER) ? buildTelUrl(CALL_PHONE_NUMBER) : null,
    enabled: isUsable(CALL_PHONE_NUMBER),
    external: false,
    Icon: FaPhoneAlt,
    disabledNote: 'Phone number not configured',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    ariaLabel: 'Message SUBAM PROMOTERS on WhatsApp',
    href: isUsable(WHATSAPP_NUMBER) ? buildWhatsAppUrl(WHATSAPP_NUMBER, WHATSAPP_MESSAGE) : null,
    enabled: isUsable(WHATSAPP_NUMBER),
    external: true,
    Icon: FaWhatsapp,
    disabledNote: 'WhatsApp number not configured',
  },
]

/* Bottom-right corner, on its own. */
const RIGHT_CONTACTS = [
  {
    id: 'instagram',
    label: 'Instagram',
    ariaLabel: 'Visit SUBAM PROMOTERS on Instagram',
    href: INSTAGRAM_URL,
    enabled: Boolean(INSTAGRAM_URL),
    external: true,
    Icon: FaInstagram,
    disabledNote: 'Instagram link not configured',
  },
]

function ContactButton({ id, label, ariaLabel, href, enabled, external, Icon, disabledNote, side }) {
  const className = `fcb__btn fcb__btn--${id} fcb__btn--on-${side}`
  const content = (
    <>
      <Icon className="fcb__icon" aria-hidden="true" focusable="false" />
      <span className="fcb__tip" aria-hidden="true">
        {label}
      </span>
    </>
  )

  return enabled ? (
    <a
      className={className}
      href={href}
      aria-label={ariaLabel}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {content}
    </a>
  ) : (
    <span
      className={`${className} is-disabled`}
      role="link"
      aria-disabled="true"
      aria-label={`${label} — ${disabledNote}`}
      title={disabledNote}
    >
      {content}
    </span>
  )
}

/**
 * Persistent contact shortcuts, pinned to the two bottom corners:
 * phone above WhatsApp on the left, Instagram on the right.
 *
 * Every target is a plain link — the phone button hands the `tel:` URL to the
 * operating system's own dialler. Nothing here places a call itself, requests
 * microphone access, or uses WebRTC or any calling, Instagram or WhatsApp API.
 *
 * A button whose number is not configured renders disabled rather than linking
 * to an invalid URL.
 */
export default function FloatingContactButtons() {
  return (
    <nav className="fcb" aria-label="Contact SUBAM PROMOTERS">
      <ul className="fcb__list fcb__list--left">
        {LEFT_CONTACTS.map(contact => (
          <li key={contact.id} className="fcb__item">
            <ContactButton {...contact} side="left" />
          </li>
        ))}
      </ul>

      <ul className="fcb__list fcb__list--right">
        {RIGHT_CONTACTS.map(contact => (
          <li key={contact.id} className="fcb__item">
            <ContactButton {...contact} side="right" />
          </li>
        ))}
      </ul>
    </nav>
  )
}
