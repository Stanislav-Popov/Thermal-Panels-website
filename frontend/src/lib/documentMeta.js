function upsertMeta(selector, createNode) {
  const existingNode = document.head.querySelector(selector)

  if (existingNode) {
    return existingNode
  }

  const nextNode = createNode()
  document.head.append(nextNode)
  return nextNode
}

export function setNamedMeta(name, content) {
  const metaNode = upsertMeta(`meta[name="${name}"]`, () => {
    const nextNode = document.createElement('meta')
    nextNode.setAttribute('name', name)
    return nextNode
  })

  metaNode.setAttribute('content', content)
}

export function setPropertyMeta(property, content) {
  const metaNode = upsertMeta(`meta[property="${property}"]`, () => {
    const nextNode = document.createElement('meta')
    nextNode.setAttribute('property', property)
    return nextNode
  })

  metaNode.setAttribute('content', content)
}
