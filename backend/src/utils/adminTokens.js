import { createHmac } from 'node:crypto'

function encodeBase64Url(value) {
  return Buffer.from(value).toString('base64url')
}

function decodeBase64Url(value) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function sign(value, secret) {
  return createHmac('sha256', secret).update(value).digest('base64url')
}

export function createAdminToken(payload, secret) {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload))
  const signature = sign(encodedPayload, secret)
  return `${encodedPayload}.${signature}`
}

export function verifyAdminToken(token, secret) {
  if (!token || !token.includes('.')) {
    return null
  }

  const [encodedPayload, signature] = token.split('.')
  const expectedSignature = sign(encodedPayload, secret)

  if (signature !== expectedSignature) {
    return null
  }

  const payload = JSON.parse(decodeBase64Url(encodedPayload))

  if (typeof payload.exp !== 'number' || payload.exp <= Date.now() / 1000) {
    return null
  }

  return payload
}
