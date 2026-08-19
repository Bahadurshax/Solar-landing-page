import { useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import installImg from '../assets/roofer-installing.jpg'
import '../styles/quote.css'

/* ============================================================
   Schedule the installation
   ============================================================

   Two columns, and they are doing two different jobs rather than balancing
   each other. The left is the photograph at full bleed — a crew on a roof,
   which is the thing being scheduled, not a mood shot. The right is the form
   at full height on lit paper.

   The night ground this band used to hold has gone with the redesign, and the
   day still reads: About ends outdoors at dusk, this is the lit interior you
   step into to arrange the work, and the testimonial wall's cream is the next
   morning. The hour is early evening, indoors, which is when someone actually
   sits down and fills a form like this in.

   Everything here is fictional, including the address it sends to — see
   PRODUCT.md. */

const TEL = '+998612248372'
const TEL_DISPLAY = '+998 (61) 224-8372'
const MAILBOX = 'contact@solstice.energy'


/* There is no backend, and a submit handler that silently discards a
   stranger's contact details would be worse than not shipping the form. So
   the form composes the enquiry and hands it to the visitor's own mail client,
   which actually delivers.

   Point ENDPOINT at a form service (Formspree, Netlify, Web3Forms) and the
   handler below posts instead, with no other change. The pending, sent and
   error states are already wired for it and are reachable only on that path.
   The mailto handoff reports `handed-off` rather than `sent`, because "we sent
   it" is not true of a form that has handed the visitor a draft to send. */
const ENDPOINT = null

const FIELDS = [
  {
    name: 'name',
    label: 'Full Name',
    type: 'text',
    placeholder: 'e.g. Aigul Seytniyazova',
    autoComplete: 'name',
    required: true,
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'aigul@example.com',
    autoComplete: 'email',
    required: true,
  },
  {
    name: 'phone',
    label: 'Phone Number',
    type: 'tel',
    placeholder: '+998 (61) 000-0000',
    autoComplete: 'tel',
    required: true,
  },
  {
    name: 'address',
    label: 'Full Address',
    type: 'text',
    placeholder: 'Street, district, and city',
    autoComplete: 'street-address',
    required: true,
  },
]

const EMPTY = { name: '', email: '', phone: '', address: '', notes: '' }

/* Deliberately permissive. A validator that insists on a shape is a validator
   that rejects real people: a Karakalpak address has no format worth
   enforcing, and a phone number that reaches a crew may be written a dozen
   ways. These check that something usable was entered, and nothing else. */
function validate(values) {
  const errors = {}

  if (!values.name.trim()) errors.name = 'Please enter your name.'

  if (!values.email.trim()) errors.email = 'Please enter your email.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
    errors.email = 'That address is missing an @ or a domain.'

  if (!values.phone.trim()) errors.phone = 'Please enter a phone number.'
  else if ((values.phone.match(/\d/g) || []).length < 7)
    errors.phone = 'That looks too short to be a phone number.'

  if (!values.address.trim())
    errors.address = 'Please enter the address for the install.'

  return errors
}

function QuoteBand() {
  const formRef = useRef(null)
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  /* idle | handed-off | sending | sent | error.

     `handed-off` belongs to the mailto path and `sending`/`sent`/`error` to the
     endpoint path. Keeping them apart is what lets the message below say what
     actually happened, rather than one hedged sentence covering both. */
  const [status, setStatus] = useState('idle')

  const setField = (name) => (event) => {
    const { value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
    /* Clear on correction, never on keystroke into an untouched field: an
       error that vanishes the moment you start typing was never read. */
    setErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
  }

  const submit = async (event) => {
    event.preventDefault()

    const found = validate(values)
    if (Object.keys(found).length) {
      setErrors(found)
      setStatus('idle')
      /* Send focus to the first problem rather than announcing a count. */
      const first = FIELDS.find((f) => found[f.name])
      formRef.current?.elements[first?.name]?.focus()
      return
    }

    setErrors({})

    /* The two paths are separated rather than sharing one `try`. They are not
       the same kind of operation: handing the enquiry to a mail client is a
       synchronous navigation that cannot fail in a way this page can observe,
       and posting it is a request that can. Sharing a `try` wrapped the mailto
       branch in a `catch` nothing could reach, and preceded it with a `sending`
       state that was over before it painted — an async shape drawn around code
       that is not async. */
    if (!ENDPOINT) {
      const body = [
        `Name: ${values.name}`,
        `Email: ${values.email}`,
        `Phone: ${values.phone}`,
        `Address: ${values.address}`,
        '',
        values.notes.trim() || 'No additional notes.',
      ].join('\n')

      window.location.href = `mailto:${MAILBOX}?subject=${encodeURIComponent(
        'Installation request',
      )}&body=${encodeURIComponent(body)}`

      setStatus('handed-off')
      setValues(EMPTY)
      return
    }

    setStatus('sending')

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error(String(res.status))

      setStatus('sent')
      setValues(EMPTY)
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="quote" id="quote" aria-labelledby="quote-title">
      <div className="quote__grid">
        <div className="quote__figure">
          <img
            className="quote__figure-media"
            src={installImg}
            alt="A roofer in a harness and hard hat seating a solar panel onto its rail on a tiled roof."
            loading="lazy"
            decoding="async"
          />

          {/* The only thing in flow in this column — the photograph behind it
              is positioned out of the way. */}
          <div className="quote__figure-copy">
            <h2 className="quote__title" id="quote-title">
              Schedule the Installation
            </h2>

            <p className="quote__lede">
              A surveyor from your own district visits first. Nothing is fitted,
              and nothing is charged, until you have the figure in writing.
            </p>
          </div>
        </div>

        {/* Fields only. The heading and its paragraph live on the photograph
            in the column to the left. */}
        <div className="quote__panel">
          <div className="quote__form-wrap">
            <form
              className="quote__form"
              ref={formRef}
              onSubmit={submit}
              noValidate
            >
              {FIELDS.map((field) => {
                const invalid = Boolean(errors[field.name])

                return (
                  <div className="quote__field" key={field.name}>
                    {/* Input first, label second, and that order is load
                        bearing: the label rides on the input's own state
                        (`:focus`, `:placeholder-shown`) through a sibling
                        selector, so it can lift out of the field without a
                        line of JS or a class per field. `htmlFor` still binds
                        the two, so nothing changes for a screen reader — it
                        hears the label with the field either way. */}
                    <input
                      className="quote__input"
                      id={`q-${field.name}`}
                      name={field.name}
                      type={field.type}
                      /* The placeholder is now a second-tier hint rather than
                         the field's name: it is transparent until the field
                         has focus, at which point the label has already
                         floated clear of it. It must stay non-empty, though —
                         `:placeholder-shown` is what tells the label whether
                         the field is empty. */
                      placeholder={field.placeholder}
                      autoComplete={field.autoComplete}
                      value={values[field.name]}
                      onChange={setField(field.name)}
                      aria-required={field.required}
                      aria-invalid={invalid || undefined}
                      aria-describedby={
                        invalid ? `q-${field.name}-error` : undefined
                      }
                    />

                    <label className="quote__label" htmlFor={`q-${field.name}`}>
                      {field.label}
                      {field.required && (
                        <span className="quote__req" aria-hidden="true">
                          *
                        </span>
                      )}
                    </label>

                    {invalid && (
                      <p className="quote__error" id={`q-${field.name}-error`}>
                        {errors[field.name]}
                      </p>
                    )}
                  </div>
                )
              })}

              <div className="quote__field">
                <textarea
                  className="quote__input quote__input--area"
                  id="q-notes"
                  name="notes"
                  rows={4}
                  placeholder="Roof type, access, or anything you want the surveyor to know"
                  value={values.notes}
                  onChange={setField('notes')}
                />
                <label className="quote__label" htmlFor="q-notes">
                  Additional Notes or Questions
                </label>
              </div>

              <button
                className="quote__submit"
                type="submit"
                disabled={status === 'sending'}
              >
                {status === 'sending' ? 'Sending…' : 'Book an Appointment'}
                <ArrowUpRight size={18} strokeWidth={2.2} aria-hidden="true" />
              </button>

              {/* One region, polite, so a screen reader hears the outcome
                  without the form shouting over the visitor mid-entry. */}
              <p className="quote__status" role="status">
                {status === 'handed-off' &&
                  'Your mail app should have opened with the details filled in. Send it and a surveyor will call you back.'}
                {status === 'sent' &&
                  'Thank you. A surveyor from your district will call you back to arrange the visit.'}
                {status === 'error' &&
                  `That did not go through. Call ${TEL_DISPLAY} and we will take the details over the phone.`}
              </p>

              <p className="quote__alt">
                Prefer to talk?{' '}
                <a className="quote__alt-link" href={`tel:${TEL}`}>
                  {TEL_DISPLAY}
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

export default QuoteBand
