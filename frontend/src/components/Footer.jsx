export function Footer({
  contacts,
  copy = 'Thermal Panels • фасадные термопанели для утепления и облицовки дома',
  telegramLabel = 'Telegram',
  vkLabel = 'VK',
  whatsappLabel = 'WhatsApp',
}) {
  const footerLinks = [
    { href: contacts.phoneHref, key: 'phone', label: contacts.phoneLabel },
    {
      external: true,
      href: contacts.whatsappHref,
      key: 'whatsapp',
      label: whatsappLabel,
    },
    {
      external: true,
      href: contacts.telegramHref,
      key: 'telegram',
      label: telegramLabel,
    },
    { external: true, href: contacts.vkHref, key: 'vk', label: vkLabel },
  ].filter((item) => item.href)

  return (
    <footer className="footer">
      <div className="layout-container footer__inner">
        <p className="footer__copy">{copy}</p>
        <div className="footer__links">
          {footerLinks.map((item) => (
            <a
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
