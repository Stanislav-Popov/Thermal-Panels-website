import {
  findDefaultSiteContentBlock,
  mergeWithDefaultSiteContentBlocks,
} from '../../data/defaultSiteContentBlocks.js'
import { normalizeSiteContentBlockForPresentation } from '../../data/runtimeContentLayer.js'
import {
  findSiteContentBlock,
  getContacts,
  listSiteContentBlocks,
  upsertContacts,
  upsertSiteContentBlock,
} from '../../repositories/siteContentRepository.js'
import { normalizeContactsInput, normalizeSiteContentBlockInput } from './adminValidators.js'

export async function listAdminSiteContentBlocks() {
  return mergeWithDefaultSiteContentBlocks(await listSiteContentBlocks()).map(
    normalizeSiteContentBlockForPresentation
  )
}

export async function updateAdminSiteContentBlock(blockKey, payload) {
  return normalizeSiteContentBlockForPresentation(
    await upsertSiteContentBlock(normalizeSiteContentBlockInput(blockKey, payload))
  )
}

export async function getAdminSiteContentBlock(blockKey) {
  return normalizeSiteContentBlockForPresentation(
    (await findSiteContentBlock(blockKey)) ?? findDefaultSiteContentBlock(blockKey)
  )
}

export async function getAdminContacts() {
  return getContacts()
}

export async function updateAdminContacts(payload) {
  return upsertContacts(normalizeContactsInput(payload))
}
