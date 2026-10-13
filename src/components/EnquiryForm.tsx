import { useId, useState, type FormEvent } from 'react'

import PeekRating from '@/components/PeekRating'
import Button from '@/components/ui/Button'
import { company, divisions } from '@/lib/site'

import './enquiry-form.css'

type Status = 'idle' | 'submitting' | 'sent' | 'error'

type Errors = Partial<Record<'name' | 'email' | 'message', string>>

/**
 * Enquiry capture with client-side validation and an accessible error summary.
 *
 * There is no backend in this project yet, so `submitEnquiry` is the single
 * integration point: replace its body with a real endpoint call and the rest of
 * the form — validation, states, routing, accessibility — keeps working.
 */
async function submitEnquiry(payload: Record<string, FormDataEntryValue | number>) {
  const endpoint = import.meta.env.VITE_ENQUIRY_ENDPOINT

  if (!endpoint) {
    /* No endpoint configured: fail loudly in dev rather than pretending to send. */
    throw new Error('No enquiry endpoint configured (set VITE_ENQUIRY_ENDPOINT).')
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) throw new Error(`Enquiry failed with status ${response.status}`)
}

export default function EnquiryForm({ defaultDivision }: { defaultDivision?: string }) {
  const id = useId()
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<Errors>({})
  const [rating, setRating] = useState(0)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)

    const next: Errors = {}
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const message = String(data.get('message') ?? '').trim()

    if (name.length < 2) next.name = 'Enter your name so we know who to reply to.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter an email address we can reply to.'
    if (message.length < 10) next.message = 'Tell us a little about the project — a sentence is enough.'

    setErrors(next)
    if (Object.keys(next).length > 0) {
      /*
        Focus by field name, not by [aria-invalid]: that attribute only appears
        after React re-renders with the new error state, which has not happened
        yet at this point in the handler.
      */
      const firstInvalid = (['name', 'email', 'message'] as const).find(field => next[field])
      if (firstInvalid) form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus()
      return
    }

    setStatus('submitting')
    try {
      await submitEnquiry({ ...Object.fromEntries(data), rating })
      setStatus('sent')
      form.reset()
      setRating(0)
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="enquiry enquiry--done" role="status">
        <h3 className="enquiry__done-title">Enquiry received</h3>
        <p>
          Thank you. We will reply to the address you gave us, usually within one working day. If
          it is urgent, call <a href={company.phoneHref}>{company.phone}</a>.
        </p>
      </div>
    )
  }

  return (
    <form className="enquiry" onSubmit={handleSubmit} noValidate>
      <div className="enquiry__row">
        <div className="field">
          <label htmlFor={`${id}-name`}>Your name</label>
          <input
            id={`${id}-name`}
            name="name"
            type="text"
            autoComplete="name"
            required
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${id}-name-error` : undefined}
          />
          {errors.name ? (
            <p className="field__error" id={`${id}-name-error`}>
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor={`${id}-email`}>Email</label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? `${id}-email-error` : undefined}
          />
          {errors.email ? (
            <p className="field__error" id={`${id}-email-error`}>
              {errors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div className="enquiry__row">
        <div className="field">
          <label htmlFor={`${id}-phone`}>Phone (optional)</label>
          <input id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" />
        </div>

        {/* Routes the enquiry to the right division. */}
        <div className="field">
          <label htmlFor={`${id}-division`}>What is this about?</label>
          <select id={`${id}-division`} name="division" defaultValue={defaultDivision ?? ''}>
            <option value="">Not sure yet</option>
            {divisions.map(division => (
              <option key={division.id} value={division.id}>
                {division.name}
              </option>
            ))}
            <option value="both">Both divisions</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor={`${id}-message`}>About the project</label>
        <textarea
          id={`${id}-message`}
          name="message"
          rows={5}
          required
          placeholder="What are you promoting, and what would a good outcome look like?"
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? `${id}-message-error` : undefined}
        />
        {errors.message ? (
          <p className="field__error" id={`${id}-message-error`}>
            {errors.message}
          </p>
        ) : null}
      </div>

      {/*
        PeekRating used as a genuine input: it captures this visitor's own
        rating and submits it with the enquiry. It never displays an aggregate
        score, because no verified feedback exists to aggregate.
      */}
      <fieldset className="field enquiry__rating">
        <legend>How clear was this website? (optional)</legend>
        <PeekRating
          value={rating}
          onChange={setRating}
          count={5}
          shape="star"
          labels={['Confusing', 'Unclear', 'Adequate', 'Clear', 'Very clear']}
          activeColor="#D4AF6A"
          idleColor="#5A7173"
          tipColor="#063B3D"
          tipTextColor="#F9F2E2"
          size={26}
          ariaLabel="Rate the clarity of this website"
        />
      </fieldset>

      {status === 'error' ? (
        <p className="enquiry__error" role="alert">
          The enquiry could not be sent. Email{' '}
          <a href={`mailto:${company.email}`}>{company.email}</a> or call{' '}
          <a href={company.phoneHref}>{company.phone}</a> and we will pick it up from there.
        </p>
      ) : null}

      <Button variant="gold" size="lg" type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending' : 'Send enquiry'}
      </Button>

      <p className="enquiry__note">
        We use these details only to reply to your enquiry. See our{' '}
        <a href="/privacy-policy/">privacy policy</a>.
      </p>
    </form>
  )
}
