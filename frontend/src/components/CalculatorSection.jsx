import { useEffect, useMemo, useRef, useState } from 'react'
import { trackGoal } from '../lib/analytics.js'
import { fetchEstimate } from '../lib/publicApi.js'
import { Section } from './Section.jsx'

const RESERVE_RATE = 0.07

const priceFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

const decimalFormatter = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 1,
})

const integerFormatter = new Intl.NumberFormat('ru-RU')

const defaultInstallationOptions = [
  {
    value: 'self',
    title: 'Самостоятельный монтаж',
    text: 'Показываем ориентир по материалу и количеству панелей.',
  },
  {
    value: 'assisted',
    title: 'Нужен расчёт с монтажом',
    text: 'Фиксируем интерес к монтажу и подсказываем, что работы уточняются отдельно.',
  },
]

function formatPrice(value) {
  return priceFormatter.format(value)
}

function formatSquareMeters(value) {
  return `${decimalFormatter.format(value)} м²`
}

export function CalculatorSection({
  contacts,
  description = '',
  error = '',
  eyebrow = '',
  isLoading = false,
  installationOptions = defaultInstallationOptions,
  products,
  title = 'Рассчитайте стоимость отделки своего дома',
}) {
  const [selectedProductSlug, setSelectedProductSlug] = useState('')
  const [facadeArea, setFacadeArea] = useState('120')
  const [installationMode, setInstallationMode] = useState('self')
  const [estimate, setEstimate] = useState(null)
  const [estimateError, setEstimateError] = useState('')
  const [isEstimateLoading, setIsEstimateLoading] = useState(false)
  const hasTrackedCalculatorStart = useRef(false)
  const lastTrackedEstimateSignature = useRef('')

  const trackCalculatorStart = () => {
    if (hasTrackedCalculatorStart.current) {
      return
    }

    hasTrackedCalculatorStart.current = true
    trackGoal('calculator_start')
  }

  useEffect(() => {
    const hasSelectedProduct = products.some(
      (product) => product.slug === selectedProductSlug
    )

    if (!hasSelectedProduct) {
      setSelectedProductSlug(products[0]?.slug ?? '')
    }
  }, [products, selectedProductSlug])

  useEffect(() => {
    const handleSelectProduct = (event) => {
      const nextSlug = event.detail?.slug

      if (!nextSlug) {
        return
      }

      setSelectedProductSlug(nextSlug)
    }

    window.addEventListener('calculator:select-product', handleSelectProduct)

    return () => {
      window.removeEventListener('calculator:select-product', handleSelectProduct)
    }
  }, [])

  const selectedProduct = useMemo(
    () => products.find((product) => product.slug === selectedProductSlug) ?? null,
    [products, selectedProductSlug]
  )

  const numericArea = Number(facadeArea)
  const isAreaValid = Number.isFinite(numericArea) && numericArea > 0
  const reservePercentage = Math.round(RESERVE_RATE * 100)

  useEffect(() => {
    if (!estimate) {
      return
    }

    const signature = [
      estimate.product.slug,
      estimate.calculation.facadeArea,
      estimate.calculation.installationMode,
      estimate.calculation.panelCount,
      estimate.calculation.totalCost,
    ].join(':')

    if (lastTrackedEstimateSignature.current === signature) {
      return
    }

    lastTrackedEstimateSignature.current = signature
    trackGoal('calculator_complete', {
      installationMode: estimate.calculation.installationMode,
      panelCount: estimate.calculation.panelCount,
      totalCost: estimate.calculation.totalCost,
    })
  }, [estimate])

  useEffect(() => {
    if (!selectedProduct || !isAreaValid) {
      setEstimate(null)
      setEstimateError('')
      setIsEstimateLoading(false)
      return undefined
    }

    const controller = new AbortController()
    const timeoutId = window.setTimeout(async () => {
      setIsEstimateLoading(true)
      setEstimate(null)
      setEstimateError('')

      try {
        const nextEstimate = await fetchEstimate(
          {
            facadeArea: numericArea,
            installationMode,
            productSlug: selectedProduct.slug,
          },
          controller.signal
        )

        setEstimate(nextEstimate)
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setEstimate(null)
          setEstimateError(requestError.message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsEstimateLoading(false)
        }
      }
    }, 220)

    return () => {
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [installationMode, isAreaValid, numericArea, selectedProduct])

  return (
    <Section
      description={description}
      eyebrow={eyebrow}
      id="calculator"
      title={title}
    >
      <div className="calculator-shell">
        <div className="calculator-form-card">
          <div className="calculator-field">
            <label className="calculator-label" htmlFor="calculator-product">
              Выберите товар
            </label>
            <select
              className="calculator-select"
              disabled={isLoading || products.length === 0}
              id="calculator-product"
              onChange={(event) => {
                trackCalculatorStart()
                setSelectedProductSlug(event.target.value)
              }}
              value={selectedProductSlug}
            >
              {products.length === 0 ? (
                <option value="">Каталог загружается</option>
              ) : (
                products.map((product) => (
                  <option key={product.slug} value={product.slug}>
                    {product.name} · {product.texture} · {formatPrice(product.priceCurrent)} за м²
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="calculator-field">
            <label className="calculator-label" htmlFor="calculator-area">
              Площадь фасада, м²
            </label>
            <input
              className="calculator-input"
              id="calculator-area"
              inputMode="decimal"
              min="1"
              onChange={(event) => {
                trackCalculatorStart()
                setFacadeArea(event.target.value)
              }}
              placeholder="Например, 120"
              step="0.1"
              type="number"
              value={facadeArea}
            />
            <p className="calculator-hint">
              В расчёт автоматически заложен запас {integerFormatter.format(reservePercentage)}%.
            </p>
          </div>

          <fieldset className="calculator-fieldset">
            <legend className="calculator-label">Сценарий монтажа</legend>
            <div className="calculator-mode-grid">
              {installationOptions.map((option) => (
                <label
                  className={`calculator-mode${installationMode === option.value ? ' calculator-mode--active' : ''}`}
                  key={option.value}
                >
                  <input
                    checked={installationMode === option.value}
                    className="calculator-mode__control"
                    name="installationMode"
                    onChange={() => {
                      trackCalculatorStart()
                      setInstallationMode(option.value)
                    }}
                    type="radio"
                    value={option.value}
                  />
                  <span className="calculator-mode__title">{option.title}</span>
                  <span className="calculator-mode__text">{option.text}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <aside aria-live="polite" className="calculator-result-card">
          <p className="calculator-result__eyebrow">Предварительный расчёт</p>

          {isLoading ? (
            <>
              <h3 className="calculator-result__title">Подключаем данные сервера</h3>
              <p className="calculator-result__note">
                Каталог загружается из backend API, после этого расчёт станет доступен.
              </p>
            </>
          ) : error ? (
            <>
              <h3 className="calculator-result__title">Калькулятор временно недоступен</h3>
              <p className="calculator-result__note">{error}</p>
            </>
          ) : estimate && selectedProduct ? (
            <>
              <h3 className="calculator-result__title">{estimate.product.name}</h3>

              <div className="calculator-result__chips">
                <span className="calculator-result__chip">{estimate.product.texture}</span>
                <span className="calculator-result__chip">
                  {estimate.calculation.installationMode === 'self'
                    ? 'Самостоятельный монтаж'
                    : 'Нужен расчёт с монтажом'}
                </span>
              </div>

              <dl className="calculator-result__grid">
                <div className="calculator-metric">
                  <dt>Площадь фасада</dt>
                  <dd>{formatSquareMeters(estimate.calculation.facadeArea)}</dd>
                </div>
                <div className="calculator-metric">
                  <dt>Запас</dt>
                  <dd>{formatSquareMeters(estimate.calculation.reserveArea)}</dd>
                </div>
                <div className="calculator-metric">
                  <dt>Площадь с запасом</dt>
                  <dd>{formatSquareMeters(estimate.calculation.areaWithReserve)}</dd>
                </div>
                <div className="calculator-metric">
                  <dt>Ориентировочно панелей</dt>
                  <dd>{integerFormatter.format(estimate.calculation.panelCount)} шт.</dd>
                </div>
                <div className="calculator-metric">
                  <dt>Покрываемая площадь</dt>
                  <dd>{formatSquareMeters(estimate.calculation.coveredArea)}</dd>
                </div>
                <div className="calculator-metric">
                  <dt>Стоимость материала</dt>
                  <dd>{formatPrice(estimate.calculation.materialCost)}</dd>
                </div>
              </dl>

              <div className="calculator-total">
                <span className="calculator-total__label">
                  {estimate.calculation.installationMode === 'self'
                    ? 'Итоговая сумма'
                    : 'Итог по материалу'}
                </span>
                <strong className="calculator-total__value">
                  {formatPrice(estimate.calculation.totalCost)}
                </strong>
              </div>

              <p className="calculator-result__note">{estimate.calculation.note}</p>

              <div className="calculator-result__actions">
                <a className="button-link" href={contacts.phoneHref}>
                  Позвонить: {contacts.phoneLabel}
                </a>
                <a
                  className="calculator-action calculator-action--ghost"
                  href={contacts.whatsappHref}
                  rel="noreferrer"
                  target="_blank"
                >
                  Написать в WhatsApp
                </a>
              </div>
            </>
          ) : isEstimateLoading ? (
            <>
              <h3 className="calculator-result__title">Пересчитываем ориентир</h3>
              <p className="calculator-result__note">
                Отправляем данные на сервер и готовим предварительный расчёт.
              </p>
            </>
          ) : estimateError ? (
            <>
              <h3 className="calculator-result__title">Не удалось выполнить расчёт</h3>
              <p className="calculator-result__note">{estimateError}</p>
            </>
          ) : (
            <>
              <h3 className="calculator-result__title">Введите площадь фасада</h3>
              <p className="calculator-result__note">
                После выбора товара и площади калькулятор покажет количество панелей,
                стоимость материала и ориентир для дальнейшего уточнения.
              </p>
            </>
          )}
        </aside>
      </div>
    </Section>
  )
}
