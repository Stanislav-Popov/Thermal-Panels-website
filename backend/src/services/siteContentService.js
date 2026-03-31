import { mergeWithDefaultSiteContentBlocks } from '../data/defaultSiteContentBlocks.js'
import {
  normalizeSiteContentBlockForPresentation,
  sanitizePublicExternalUrl,
} from '../data/runtimeContentLayer.js'
import { getSiteContentBundle } from '../repositories/siteContentRepository.js'

export async function getPublicSiteContent() {
  const bundle = await getSiteContentBundle()
  const contacts = bundle.contacts
    ? {
        ...bundle.contacts,
        maxUrl: sanitizePublicExternalUrl(bundle.contacts.maxUrl),
        telegramUrl: sanitizePublicExternalUrl(bundle.contacts.telegramUrl),
        vkUrl: sanitizePublicExternalUrl(bundle.contacts.vkUrl),
        whatsappUrl: sanitizePublicExternalUrl(bundle.contacts.whatsappUrl),
      }
    : null

  return {
    ...bundle,
    contacts,
    blocks: mergeWithDefaultSiteContentBlocks(bundle.blocks).map(
      normalizeSiteContentBlockForPresentation
    ),
  }
}
