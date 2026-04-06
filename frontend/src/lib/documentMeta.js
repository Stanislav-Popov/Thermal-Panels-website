function upsertHeadNode(selector, createNode) {
  const existingNode = document.head.querySelector(selector)

  if (existingNode) {
    return existingNode
  }

  const nextNode = createNode()
  document.head.append(nextNode)
  return nextNode
}

export function setNamedMeta(name, content) {
  const metaNode = upsertHeadNode(`meta[name="${name}"]`, () => {
    const nextNode = document.createElement('meta')
    nextNode.setAttribute('name', name)
    return nextNode
  })

  metaNode.setAttribute('content', content)
}

export function setPropertyMeta(property, content) {
  const metaNode = upsertHeadNode(`meta[property="${property}"]`, () => {
    const nextNode = document.createElement('meta')
    nextNode.setAttribute('property', property)
    return nextNode
  })

  metaNode.setAttribute('content', content)
}

export function setLinkTag(rel, href, attributes = {}) {
  const linkNode = upsertHeadNode(`link[rel="${rel}"]`, () => {
    const nextNode = document.createElement('link')
    nextNode.setAttribute('rel', rel)
    return nextNode
  })

  linkNode.setAttribute('href', href)

  Object.entries(attributes).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      linkNode.removeAttribute(key)
      return
    }

    linkNode.setAttribute(key, value)
  })
}

export function setJsonLdScript(key, value) {
  const scriptNode = upsertHeadNode(`script[data-seo-key="${key}"]`, () => {
    const nextNode = document.createElement('script')
    nextNode.setAttribute('data-seo-key', key)
    nextNode.setAttribute('type', 'application/ld+json')
    return nextNode
  })

  scriptNode.textContent = JSON.stringify(value).replace(/</g, '\\u003c')
}
