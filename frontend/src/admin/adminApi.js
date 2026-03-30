const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

function getApiUrl(pathname) {
  return `${apiBaseUrl}${pathname}`
}

async function readResponsePayload(response) {
  const rawBody = await response.text()

  if (!rawBody) {
    return null
  }

  try {
    return JSON.parse(rawBody)
  } catch {
    return {
      rawBody,
    }
  }
}

async function parseResponse(response) {
  if (response.status === 204 || response.status === 205) {
    return null
  }

  const payload = await readResponsePayload(response)

  if (!response.ok) {
    const error = new Error(
      payload?.error?.message ??
        payload?.rawBody ??
        'Не удалось выполнить запрос к admin API.'
    )
    error.status = response.status
    throw error
  }

  return payload
}

async function adminRequest(pathname, { body, method = 'GET', token } = {}) {
  const headers = {}

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(getApiUrl(pathname), {
    body: body !== undefined ? JSON.stringify(body) : undefined,
    headers,
    method,
  })

  return parseResponse(response)
}

export async function uploadAdminImage(token, scope, file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(getApiUrl(`/api/admin/uploads/images/${scope}`), {
    body: formData,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method: 'POST',
  })

  return parseResponse(response)
}

export function loginAdmin(credentials) {
  return adminRequest('/api/admin/auth/login', {
    body: credentials,
    method: 'POST',
  })
}

export function fetchAdminProducts(token) {
  return adminRequest('/api/admin/products', { token })
}

export function createAdminProduct(token, product) {
  return adminRequest('/api/admin/products', {
    body: product,
    method: 'POST',
    token,
  })
}

export function updateAdminProduct(token, productId, product) {
  return adminRequest(`/api/admin/products/${productId}`, {
    body: product,
    method: 'PUT',
    token,
  })
}

export function deleteAdminProduct(token, productId) {
  return adminRequest(`/api/admin/products/${productId}`, {
    method: 'DELETE',
    token,
  })
}

export function createAdminProductImage(token, productId, image) {
  return adminRequest(`/api/admin/products/${productId}/images`, {
    body: image,
    method: 'POST',
    token,
  })
}

export function deleteAdminProductImage(token, productId, imageId) {
  return adminRequest(`/api/admin/products/${productId}/images/${imageId}`, {
    method: 'DELETE',
    token,
  })
}

export function fetchAdminShowcaseObjects(token) {
  return adminRequest('/api/admin/showcase-objects', { token })
}

export function createAdminShowcaseObject(token, object) {
  return adminRequest('/api/admin/showcase-objects', {
    body: object,
    method: 'POST',
    token,
  })
}

export function updateAdminShowcaseObject(token, objectId, object) {
  return adminRequest(`/api/admin/showcase-objects/${objectId}`, {
    body: object,
    method: 'PUT',
    token,
  })
}

export function deleteAdminShowcaseObject(token, objectId) {
  return adminRequest(`/api/admin/showcase-objects/${objectId}`, {
    method: 'DELETE',
    token,
  })
}

export function fetchAdminSiteContent(token) {
  return adminRequest('/api/admin/site-content', { token })
}

export function updateAdminSiteContentBlock(token, blockKey, block) {
  return adminRequest(`/api/admin/site-content/${blockKey}`, {
    body: block,
    method: 'PUT',
    token,
  })
}

export function fetchAdminContacts(token) {
  return adminRequest('/api/admin/contacts', { token })
}

export function updateAdminContacts(token, contacts) {
  return adminRequest('/api/admin/contacts', {
    body: contacts,
    method: 'PUT',
    token,
  })
}

export async function fetchAdminDashboard(token) {
  const [productsPayload, showcasePayload, siteContentPayload, contacts] =
    await Promise.all([
      fetchAdminProducts(token),
      fetchAdminShowcaseObjects(token),
      fetchAdminSiteContent(token),
      fetchAdminContacts(token),
    ])

  return {
    contacts,
    products: productsPayload.items,
    showcaseObjects: showcasePayload.items,
    siteContentBlocks: siteContentPayload.items,
  }
}
