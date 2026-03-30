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
    const message =
      payload?.error?.message ??
      payload?.rawBody ??
      'Не удалось получить данные от сервера.'
    throw new Error(message)
  }

  return payload
}

export async function fetchProducts(signal) {
  const response = await fetch(getApiUrl('/api/products'), {
    signal,
  })
  const payload = await parseResponse(response)
  return payload.items
}

export async function fetchSiteContent(signal) {
  const response = await fetch(getApiUrl('/api/site-content'), {
    signal,
  })

  return parseResponse(response)
}

export async function fetchEstimate(input, signal) {
  const response = await fetch(getApiUrl('/api/calculator/estimate'), {
    body: JSON.stringify(input),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    signal,
  })

  return parseResponse(response)
}
