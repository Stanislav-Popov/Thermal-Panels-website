import { Section } from './Section.jsx'

export function ProjectExamplesSection({ examples }) {
  return (
    <Section
      description="Фото домов помогают понять, как разные фактуры и оттенки смотрятся на фасаде в реальном масштабе."
      eyebrow="Примеры объектов"
      id="examples"
      title="Как термопанели смотрятся на доме"
    >
      <div className="examples-grid">
        {examples.map((example, index) => (
          <article className="example-card" key={`${example.image}-${index}`}>
            <img
              alt={example.title || `Фото объекта ${index + 1}`}
              className="example-card__image"
              src={example.image}
            />
          </article>
        ))}
      </div>
    </Section>
  )
}
