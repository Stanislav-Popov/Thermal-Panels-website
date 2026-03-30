import { Section } from './Section.jsx'

export function ProductDescriptionSection({ blocks, image }) {
  return (
    <Section
      description="Коротко собрали основную информацию о материале, фактурах, цветовых решениях и особенностях применения на фасаде."
      eyebrow="Описание продукта"
      id="product-description"
      title="Что важно знать о термопанелях перед выбором"
    >
      <div className="description-layout">
        <div className="description-media">
          <img
            alt="Варианты фасадных термопанелей"
            className="description-media__image"
            src={image}
          />
        </div>

        <div className="description-content">
          <div className="description-grid">
            {blocks.map((block) => (
              <article className="description-card" key={block.title}>
                <h3 className="description-card__title">{block.title}</h3>
                <p className="description-card__text">{block.text}</p>
              </article>
            ))}
          </div>

          <div className="description-cta">
            <div>
              <h3 className="description-cta__title">
                Нужен подбор фактуры и оттенка?
              </h3>
              <p className="description-cta__text">
                Отправьте фото дома или пример фасада, и мы подскажем подходящий
                вариант.
              </p>
            </div>
            <a className="button-link" href="#contacts">
              Получить консультацию
            </a>
          </div>
        </div>
      </div>
    </Section>
  )
}
