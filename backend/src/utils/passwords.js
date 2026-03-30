import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

export function createPasswordHash(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password, passwordHash) {
  const [salt, storedHash] = passwordHash.split(':')

  if (!salt || !storedHash) {
    return false
  }

  const nextHash = scryptSync(password, salt, 64)
  const storedHashBuffer = Buffer.from(storedHash, 'hex')

  if (storedHashBuffer.length !== nextHash.length) {
    return false
  }

  return timingSafeEqual(storedHashBuffer, nextHash)
}
