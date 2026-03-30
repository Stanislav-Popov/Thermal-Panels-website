import { Section } from './Section.jsx'

export function ContactsSection({
  channels,
  description = '',
  eyebrow = '',
  title = 'Свяжитесь удобным способом',
}) {
  return (
    <Section
      description={description}
      eyebrow={eyebrow}
      id="contacts"
      title={title}
    >
      <div className="contacts-grid">
        {channels.map((channel) => (
          <a
            className="contact-card contact-card--link"
            href={channel.href}
            key={channel.label}
            rel={channel.external ? 'noreferrer' : undefined}
            target={channel.external ? '_blank' : undefined}
          >
            <div className="contact-card__summary">
              <p className="contact-card__label">{channel.label}</p>
              <h3 className="contact-card__value">{channel.value}</h3>
            </div>
            <p className="contact-card__meta">{channel.description}</p>
            <span className="contact-card__action">{channel.actionLabel}</span>
          </a>
        ))}
      </div>
    </Section>
  )
}
