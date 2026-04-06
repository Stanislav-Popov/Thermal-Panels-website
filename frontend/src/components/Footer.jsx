import { sectionTextDefaults } from '../content/siteTextDefaults.js'

const footerMessengerOrder = ['whatsapp', 'telegram', 'max']

export function Footer({
  contacts,
  copy = sectionTextDefaults.footer.copy,
  maxLabel = sectionTextDefaults.footer.maxLabel,
  telegramLabel = sectionTextDefaults.footer.telegramLabel,
  whatsappLabel = sectionTextDefaults.footer.whatsappLabel,
}) {
  const messengerLabels = {
    max: maxLabel,
    telegram: telegramLabel,
    whatsapp: whatsappLabel,
  }
  const messengerLinks = {
    max: contacts.maxHref,
    telegram: contacts.telegramHref,
    whatsapp: contacts.whatsappHref,
  }
  const messengerItems = footerMessengerOrder.map((key) => ({
    href: messengerLinks[key],
    key,
    label: messengerLabels[key],
  }))
  const footerLinks = [
    { href: contacts.phoneHref, key: 'phone', label: contacts.phoneLabel },
  ].filter((item) => item.href)

  return (
    <footer className="footer">
      <div className="layout-container footer__inner">
        <p className="footer__copy">{copy}</p>
        <div className="footer__links">
          <div className="footer__messengers" aria-label="Быстрый переход в мессенджеры">
            {messengerItems.map((item) =>
              item.href ? (
                <a
                  className="footer__link"
                  href={item.href}
                  key={item.key}
                  rel="noreferrer"
                  target="_blank"
                >
                  {item.label}
                </a>
              ) : (
                <span
                  aria-disabled="true"
                  className="footer__link footer__link--disabled"
                  key={item.key}
                >
                  {item.label}
                </span>
              )
            )}
          </div>
          {footerLinks.map((item) => (
            <a
              className="footer__link"
              href={item.href}
              key={item.key}
              rel={item.external ? 'noreferrer' : undefined}
              target={item.external ? '_blank' : undefined}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
