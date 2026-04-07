import { Section } from './Section.jsx'
import { sectionTextDefaults } from '../content/siteTextDefaults.js'
import { defaultContactChannelConfigs } from '../content/siteTextDefaults.js'

const messengerActionOrder = ['whatsapp', 'telegram']

export function ContactsSection({
  channels,
  description = '',
  eyebrow = '',
  introEyebrow = sectionTextDefaults.contacts.introEyebrow,
  introText = sectionTextDefaults.contacts.introText,
  title = sectionTextDefaults.contacts.title,
}) {
  const primaryChannel = channels[0] ?? null
  const secondaryChannels = primaryChannel ? channels.slice(1) : channels
  const listChannels = secondaryChannels.filter(
    (channel) => !messengerActionOrder.includes(channel.key)
  )
  const channelsByKey = new Map(
    secondaryChannels.map((channel) => [channel.key, channel])
  )
  const messengerActions = messengerActionOrder.map((key) => {
    const resolvedChannel = channelsByKey.get(key)
    const fallbackConfig = defaultContactChannelConfigs.find(
      (channel) => channel.key === key
    )

    if (resolvedChannel) {
      return resolvedChannel
    }

    return fallbackConfig
      ? {
          ...fallbackConfig,
          href: '',
          key,
          value: fallbackConfig.label,
        }
      : null
  })
  const primaryMessengerIndex = messengerActions.findIndex((channel) => channel?.href)

  return (
    <Section
      description={description}
      eyebrow={eyebrow}
      id="contacts"
      title={title}
    >
      <div className="contacts-block">
        <div className="contacts-block__top">
          <div className="contacts-block__copy">
            <p className="contacts-block__eyebrow">{introEyebrow}</p>
            {primaryChannel ? (
              <a
                className="contacts-block__phone"
                href={primaryChannel.href}
                rel={primaryChannel.external ? 'noreferrer' : undefined}
                target={primaryChannel.external ? '_blank' : undefined}
              >
                {primaryChannel.value}
              </a>
            ) : null}
            <p className="contacts-block__text">{introText}</p>
          </div>

          {messengerActions.some(Boolean) ? (
            <div
              aria-label="Быстрый переход в мессенджеры"
              className="contacts-block__actions"
              role="group"
            >
              {messengerActions.map((channel, index) => {
                if (!channel) {
                  return null
                }

                const isPrimaryAction =
                  primaryMessengerIndex === -1
                    ? index === 0
                    : index === primaryMessengerIndex
                const actionClassName = isPrimaryAction
                  ? 'button-link contacts-block__action'
                  : 'contacts-block__action contacts-block__action--secondary'

                if (channel.href) {
                  return (
                    <a
                      className={actionClassName}
                      href={channel.href}
                      key={channel.key}
                      rel={channel.external ? 'noreferrer' : undefined}
                      target={channel.external ? '_blank' : undefined}
                    >
                      {channel.label}
                    </a>
                  )
                }

                return (
                  <span
                    aria-disabled="true"
                    className={`${actionClassName} contacts-block__action--disabled`}
                    key={channel.key}
                  >
                    {channel.label}
                  </span>
                )
              })}
            </div>
          ) : null}
        </div>

        {listChannels.length > 0 ? (
          <div className="contacts-list" aria-label="Каналы связи">
            {listChannels.map((channel) => (
              <a
                className="contact-row"
                href={channel.href}
                key={channel.label}
                rel={channel.external ? 'noreferrer' : undefined}
                target={channel.external ? '_blank' : undefined}
              >
                <div className="contact-row__main">
                  <p className="contact-row__label">{channel.label}</p>
                  <h3 className="contact-row__value">{channel.value}</h3>
                  <p className="contact-row__description">{channel.description}</p>
                </div>
                <span className="contact-row__action">{channel.actionLabel}</span>
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </Section>
  )
}
