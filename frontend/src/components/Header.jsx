import { useState } from 'react'
import { sectionTextDefaults } from '../content/siteTextDefaults.js'

export function Header({
  brand = {},
  contacts,
  headerCta = {},
  menuActions,
  menuItems,
  phoneShortLabel = sectionTextDefaults.header.phoneShortLabel,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const menuClassName = isOpen ? 'site-menu site-menu--open' : 'site-menu'
  const brandLogo = brand.logo ?? sectionTextDefaults.header.brandLogo
  const messengerItems = [
    {
      ariaLabel: 'Перейти к контактам',
      href: '#contacts',
      key: 'contacts',
      label: 'Контакты',
    },
  ].filter((item) => item.key === 'contacts' || item.href)

  return (
    <header className="site-header">
      <div className="layout-container site-header__bar">
        <a className="brand-mark" href="#top" onClick={() => setIsOpen(false)}>
          {brandLogo ? (
            <img
              alt={brand.title ?? sectionTextDefaults.header.brandTitle}
              className="brand-mark__logo"
              src={brandLogo}
            />
          ) : (
            <span className="brand-mark__badge">
              {brand.badge ?? sectionTextDefaults.header.brandBadge}
            </span>
          )}
          <span className="brand-mark__text">
            <span className="brand-mark__title">
              {brand.title ?? sectionTextDefaults.header.brandTitle}
            </span>
            <span className="brand-mark__subtitle">
              {brand.subtitle ?? sectionTextDefaults.header.brandSubtitle}
            </span>
          </span>
        </a>

        <div className="site-header__actions">
          <div className="site-header__contacts">
            <a className="site-header__phone" href={contacts.phoneHref}>
              <span className="site-header__phone-label">
                {contacts.phoneLabel}
              </span>
              <span className="site-header__phone-short">{phoneShortLabel}</span>
            </a>

            {messengerItems.length > 0 ? (
              <div className="site-header__messengers" aria-label="Мессенджеры">
                {messengerItems.map((item) => (
                  <a
                    aria-label={item.ariaLabel}
                    className="site-header__messenger"
                    href={item.href}
                    key={item.key}
                    onClick={() => setIsOpen(false)}
                    rel={item.key === 'contacts' ? undefined : 'noreferrer'}
                    target={item.key === 'contacts' ? undefined : '_blank'}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <a
            className="site-header__cta"
            href={headerCta.href ?? sectionTextDefaults.header.ctaHref}
          >
            <span className="site-header__cta-label">
              {headerCta.label ?? sectionTextDefaults.header.ctaLabel}
            </span>
            <span className="site-header__cta-short">
              {headerCta.shortLabel ?? 'Расчёт'}
            </span>
          </a>
          <button
            aria-controls="desktop-navigation"
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
            className="site-header__toggle"
            onClick={() => setIsOpen((open) => !open)}
            type="button"
          >
            {isOpen ? 'Закрыть' : 'Меню'}
          </button>
        </div>
      </div>

      <div className={menuClassName} id="desktop-navigation">
        <div className="layout-container site-menu__inner">
          <nav className="site-menu__links" aria-label="Основная навигация">
            {menuItems.map((item) => (
              <a
                className="site-menu__link"
                href={item.href}
                key={item.href}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="site-menu__actions">
            {menuActions.map((action) => (
              <a
                className={`site-menu__action site-menu__action--${action.variant}`}
                href={action.href}
                key={action.label}
                onClick={() => setIsOpen(false)}
                rel={action.external ? 'noreferrer' : undefined}
                target={action.external ? '_blank' : undefined}
              >
                {action.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}
