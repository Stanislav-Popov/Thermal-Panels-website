export function Section({ id, eyebrow, title, description, children }) {
  return (
    <section className="section" id={id}>
      <div className="layout-container">
        <div className="section__intro">
          {eyebrow ? <span className="section__eyebrow">{eyebrow}</span> : null}
          <h2 className="section__title">{title}</h2>
          {description ? (
            <p className="section__description">{description}</p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  )
}
