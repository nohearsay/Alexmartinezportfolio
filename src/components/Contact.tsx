/**
 * Contact — the closing section, used on both / and /contact.
 *
 * SITE P4 changes:
 *  · the heading level is a prop, so /contact owns a real h1 (--fs-h1, 72/36)
 *    instead of opening the page with an h2. That is what closes "Contact has
 *    no h1";
 *  · the heading, lede and form panel are on the token layer (no `.display`,
 *    no `.panel`, no ad-hoc margins), so every padding and gap here is on the
 *    spacing grid and every text node is one of the nine type steps;
 *  · the form behaviour is untouched: there is no endpoint behind a static
 *    export, so it validates, says so honestly, and clears.
 *
 * SITE CV: the heading, the lede and the project-type options come from
 * src/data/cv.ts, and the two channels are IDENTITY.email and IDENTITY.linkedin
 * — the CV contact details only. The Behance channel and the placeholder
 * portfolio address are gone.
 */
import { useRef, useState } from 'react'
import { useReveals } from '../motion/useReveals'
import { CONTACT, IDENTITY } from '../data/cv'

interface ContactFormData {
  name: string
  email: string
  project: string
  message: string
}

const emptyForm: ContactFormData = { name: '', email: '', project: '', message: '' }

const CHANNELS = [
  { label: 'Email', value: IDENTITY.email, href: `mailto:${IDENTITY.email}` },
  { label: 'LinkedIn', value: IDENTITY.linkedin, href: IDENTITY.linkedinUrl }
]

interface ContactProps {
  /** h1 on /contact (the page owns its heading), h2 on / */
  level?: 'h1' | 'h2'
}

export const Contact = ({ level = 'h2' }: ContactProps) => {
  const rootRef = useRef<HTMLElement>(null)
  const [formData, setFormData] = useState<ContactFormData>(emptyForm)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle')
  useReveals(rootRef)

  const Tag = level

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault()
    setStatus('submitting')
    await new Promise((resolve) => setTimeout(resolve, 350))
    console.warn('Contact form is a placeholder — no endpoint is configured, so nothing was sent.')
    setStatus('success')
    setFormData(emptyForm)
    window.setTimeout(() => setStatus('idle'), 4000)
  }

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  return (
    <section className="section" id="contact" ref={rootRef} aria-labelledby="contact-title">
      <div className="shell">
        <div className="contact">
          <div className="contact__intro">
            <p className="eyebrow reveal">Contact</p>
            <Tag id="contact-title" className="reveal">
              Let&rsquo;s work <span className="tone-mute">together.</span>
            </Tag>
            <p className="lede reveal">{CONTACT.lede}</p>
          </div>

          <ul className="contact__channels reveal">
            {CHANNELS.map((channel) => (
              <li key={channel.label}>
                <a
                  href={channel.href}
                  target={channel.href.startsWith("http") ? "_blank" : undefined}
                  rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="contact__channel"
                >
                  <span className="eyebrow">{channel.label}</span>
                  <span className="contact__value" style={{ fontSize: "var(--fs-body)", color: "#fff", textDecoration: "underline underline-offset-8" }}>{channel.value}</span>
                </a>
              </li>
            ))}
          </ul>

          <form className="contact__form reveal" onSubmit={(e) => void handleSubmit(e)} noValidate>
            <div className="contact__row" style={{ display: "grid", gap: "16px", marginBottom: "16px" }}>
              <label className="contact__field" htmlFor="name">
                <span className="eyebrow">Name</span>
                <input
                                  type="text"
                                  id="name"
                                  name="name"
                                  value={formData.name}
                                  onChange={handleChange}
                                  required
                                  autoComplete="name"
                                  placeholder="Your name"
                                  disabled={status === "submitting"}
                                />
              </label>
              <label className="contact__field" htmlFor="email">
                <span className="eyebrow">Email</span>
                <input
                                  type="email"
                                  id="email"
                                  name="email"
                                  value={formData.email}
                                  onChange={handleChange}
                                  required
                                  autoComplete="email"
                                  placeholder="your@email.com"
                                  disabled={status === "submitting"}
                                />
              </label>
            </div>
            <label className="contact__field" htmlFor="message">
              <span className="eyebrow">Message</span>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Tell me about the project, the timeline and the budget…"
                disabled={status === "submitting"}
                style={{ height: "48px", borderRadius: "12px", background: "var(--bg-2)", border: "1px solid var(--line)", color: "var(--fg)" }}
              />
            </label>
            <button type="submit" className="btn contact__submit" style={{ background: "#fff", color: "#000", height: "48px", border: "none", borderRadius: "999px", padding: "0 24px", fontSize: "var(--fs-small)", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase" }} disabled={status === "submitting"}>
              {status === "success" ? "Sent — well, staged" : status === "submitting" ? "Sending…" : "Send message"}
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
            <p className="contact__note" role="status">
              {status === "success"
                ? "This is a static export with no form endpoint — nothing left the browser. Wire it to your provider of choice before launch."
                : "Static export: submissions are staged locally and are not transmitted."}
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
