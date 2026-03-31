import { useEffect, useId, useRef, useState } from 'react'
import { sectionTextDefaults } from '../content/siteTextDefaults.js'
import { trackGoal } from '../lib/analytics.js'
import {
  createCalculatorEstimate,
  formatCalculatorInteger,
  formatCalculatorPrice,
  formatCalculatorSquareMeters,
  getCalculatorAreaValidationMessage,
} from '../lib/calculator.js'
import { Section } from './Section.jsx'

function getProductOptionLabel(product) {
  return `${product.name} · ${product.texture} · ${formatCalculatorPrice(
    product.priceCurrent
  )} за м²`
}

function CalculatorProductSelect({
  disabled = false,
  label,
  onChange,
  options,
  value,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef(null)
  const optionRefs = useRef([])
  const labelId = useId()
  const listboxId = useId()
  const triggerId = useId()
  const isMenuOpen = isOpen && !disabled
  const selectedOption = options.find((option) => option.value === value) ?? null

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined
    }

    const selectedIndex = Math.max(
      0,
      options.findIndex((option) => option.value === value)
    )
    const frameId = window.requestAnimationFrame(() => {
      optionRefs.current[selectedIndex]?.focus()
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [isMenuOpen, options, value])

  const handleSelect = (nextValue) => {
    onChange(nextValue)
    setIsOpen(false)
  }

  const handleOptionKeyDown = (event, optionIndex) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      optionRefs.current[(optionIndex + 1) % options.length]?.focus()
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      optionRefs.current[
        (optionIndex - 1 + options.length) % options.length
      ]?.focus()
    }
  }

  return (
    <div className="calculator-field">
      <label className="calculator-label" id={labelId}>
        {label}
      </label>
      <div
        className={`calculator-selectbox${
          isMenuOpen ? ' calculator-selectbox--open' : ''
        }`}
        ref={rootRef}
      >
        <button
          aria-controls={listboxId}
          aria-expanded={isMenuOpen}
          aria-haspopup="listbox"
          aria-labelledby={`${labelId} ${triggerId}`}
          className="calculator-select calculator-selectbox__trigger"
          disabled={disabled}
          id={triggerId}
          onClick={() => setIsOpen((open) => !open)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault()
              setIsOpen(true)
            }

            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              setIsOpen((open) => !open)
            }
          }}
          type="button"
        >
          <span className="calculator-selectbox__value">
            {selectedOption?.label ?? 'Каталог загружается'}
          </span>
          <span aria-hidden="true" className="calculator-selectbox__chevron" />
        </button>

        {isMenuOpen ? (
          <div
            aria-labelledby={labelId}
            className="calculator-selectbox__menu"
            id={listboxId}
            role="listbox"
          >
            {options.map((option, optionIndex) => {
              const isSelected = option.value === value

              return (
                <button
                  aria-selected={isSelected}
                  className={`calculator-selectbox__option${
                    isSelected ? ' calculator-selectbox__option--selected' : ''
                  }`}
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  onKeyDown={(event) => handleOptionKeyDown(event, optionIndex)}
                  ref={(node) => {
                    optionRefs.current[optionIndex] = node
                  }}
                  role="option"
                  tabIndex={isSelected ? 0 : -1}
                  type="button"
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function CalculatorSection({
  error = '',
  isLoading = false,
  products,
  title = sectionTextDefaults.calculator.title,
}) {
  const [selectedProductSlug, setSelectedProductSlug] = useState('')
  const [facadeArea, setFacadeArea] = useState('')
  const [hasInteracted, setHasInteracted] = useState(false)
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
    const handleSelectProduct = (event) => {
      const nextSlug = event.detail?.slug

      if (!nextSlug) {
        return
      }

      setHasInteracted(true)
      trackCalculatorStart()
      setSelectedProductSlug(nextSlug)
    }

    window.addEventListener('calculator:select-product', handleSelectProduct)

    return () => {
      window.removeEventListener('calculator:select-product', handleSelectProduct)
    }
  }, [])

  const resolvedProductSlug = products.some(
    (product) => product.slug === selectedProductSlug
  )
    ? selectedProductSlug
    : products[0]?.slug ?? ''
  const selectedProduct =
    products.find((product) => product.slug === resolvedProductSlug) ?? null
  const areaValidationMessage = getCalculatorAreaValidationMessage(
    facadeArea,
    hasInteracted
  )
  const estimate = createCalculatorEstimate(selectedProduct, facadeArea)

  useEffect(() => {
    if (!hasInteracted || !estimate) {
      return
    }

    const signature = [
      estimate.productSlug,
      estimate.facadeArea,
      estimate.panelCount,
      estimate.totalCost,
    ].join(':')

    if (lastTrackedEstimateSignature.current === signature) {
      return
    }

    lastTrackedEstimateSignature.current = signature
    trackGoal('calculator_complete', {
      panelCount: estimate.panelCount,
      totalCost: estimate.totalCost,
    })
  }, [estimate, hasInteracted])
  const totalCostValue = estimate
    ? `~${formatCalculatorPrice(estimate.totalCost)}`
    : '—'
  const facadeAreaValue = estimate
    ? formatCalculatorSquareMeters(estimate.facadeArea)
    : '—'
  const panelCountValue = estimate
    ? `~${formatCalculatorInteger(estimate.panelCount)} шт.`
    : '—'
  const pricePerSquareMeterValue = selectedProduct
    ? `${formatCalculatorPrice(selectedProduct.priceCurrent)}/м²`
    : '—'
  const productOptions = products.map((product) => ({
    label: getProductOptionLabel(product),
    value: product.slug,
  }))
  const statusMessage = isLoading
    ? 'Каталог загружается.'
    : error
      ? error
      : areaValidationMessage

  return (
    <Section id="calculator" title={title}>
      <div className="calculator-shell">
        <div className="calculator-form-card calculator-form-card--single">
          <CalculatorProductSelect
            disabled={isLoading || productOptions.length === 0}
            label="Выберите панель"
            onChange={(nextSlug) => {
              setHasInteracted(true)
              trackCalculatorStart()
              setSelectedProductSlug(nextSlug)
            }}
            options={productOptions}
            value={resolvedProductSlug}
          />

          <div className="calculator-field">
            <label className="calculator-label" htmlFor="calculator-area">
              Площадь фасада
            </label>
            <input
              className="calculator-input"
              id="calculator-area"
              inputMode="decimal"
              min="1"
              onChange={(event) => {
                setHasInteracted(true)
                trackCalculatorStart()
                setFacadeArea(event.target.value)
              }}
              placeholder="Например, 120"
              step="0.1"
              type="number"
              value={facadeArea}
            />
          </div>

          {statusMessage ? (
            <p className="calculator-inline-message calculator-inline-message--warning">
              {statusMessage}
            </p>
          ) : null}

          <div aria-live="polite" className="calculator-result-stack">
            <div className="calculator-total calculator-total--single">
              <span className="calculator-total__label">Итого</span>
              <strong className="calculator-total__value">{totalCostValue}</strong>
            </div>

            <dl className="calculator-result__grid calculator-result__grid--simple">
              <div className="calculator-metric">
                <dt>Площадь</dt>
                <dd>{facadeAreaValue}</dd>
              </div>
              <div className="calculator-metric">
                <dt>Панелей</dt>
                <dd>{panelCountValue}</dd>
              </div>
              <div className="calculator-metric">
                <dt>Цена</dt>
                <dd>{pricePerSquareMeterValue}</dd>
              </div>
            </dl>
          </div>

          {estimate ? (
            <a className="button-link" href="#contacts">
              Уточнить расчёт
            </a>
          ) : null}
        </div>
      </div>
    </Section>
  )
}
