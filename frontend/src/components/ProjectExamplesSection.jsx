import { useState } from 'react'
import { Section } from './Section.jsx'

export function ProjectExamplesSection({ examples }) {
  const filters = ['Все', ...new Set(examples.map((example) => example.texture))]
  const [activeFilter, setActiveFilter] = useState(filters[0])

  const visibleExamples =
    activeFilter === 'Все'
      ? examples
      : examples.filter((example) => example.texture === activeFilter)

  return (
    <Section
      description="Фото домов помогают понять, как разные фактуры и оттенки смотрятся на фасаде в реальном масштабе."
      eyebrow="Примеры объектов"
      id="examples"
      title="Как термопанели смотрятся на доме"
    >
      <div className="examples-toolbar">
        {filters.map((filter) => (
          <button
            aria-pressed={filter === activeFilter}
            className={`examples-filter${filter === activeFilter ? ' examples-filter--active' : ''}`}
            key={filter}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="examples-grid">
        {visibleExamples.map((example) => (
          <article className="example-card" key={example.title}>
            <img
              alt={example.title}
              className="example-card__image"
              src={example.image}
            />
            <div className="example-card__body">
              <h3 className="example-card__title">{example.title}</h3>
              <p className="example-card__meta">{example.texture}</p>
              <p className="example-card__meta">{example.color}</p>
              <p className="example-card__text">{example.note}</p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}
