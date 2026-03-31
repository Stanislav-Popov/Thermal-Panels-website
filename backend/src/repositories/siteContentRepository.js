import { query } from '../db/pool.js'
import { resolveShowcaseImagePath } from '../data/runtimeContentLayer.js'
import { defaultShowcaseObjects } from '../../../shared/defaultShowcaseObjects.js'

let ensureContactsSchemaPromise = null
let ensureShowcaseObjectsPromise = null

async function ensureContactsSchemaCompatibility() {
  if (!ensureContactsSchemaPromise) {
    ensureContactsSchemaPromise = query(
      `
        ALTER TABLE contacts
        ADD COLUMN IF NOT EXISTS max_url TEXT NOT NULL DEFAULT ''
      `
    ).catch((error) => {
      ensureContactsSchemaPromise = null
      throw error
    })
  }

  await ensureContactsSchemaPromise
}

async function ensureShowcaseObjectsCompatibility() {
  if (!ensureShowcaseObjectsPromise) {
    ensureShowcaseObjectsPromise = (async () => {
      for (const item of defaultShowcaseObjects) {
        await query(
          `
            INSERT INTO showcase_objects (
              title,
              texture,
              color,
              description,
              cover_image_path,
              is_published
            )
            SELECT $1, $2, $3, $4, $5, $6
            WHERE NOT EXISTS (
              SELECT 1
              FROM showcase_objects
              WHERE cover_image_path = $5
            )
          `,
          [
            item.title,
            item.texture,
            item.color,
            item.description,
            item.coverImagePath,
            item.isPublished,
          ]
        )
      }
    })().catch((error) => {
      ensureShowcaseObjectsPromise = null
      throw error
    })
  }

  await ensureShowcaseObjectsPromise
}

function mapBlockRow(row) {
  return {
    blockKey: row.block_key,
    title: row.title,
    subtitle: row.subtitle,
    body: row.body,
    ctaLabel: row.cta_label,
    ctaLink: row.cta_link,
    extraData: row.extra_data_json ?? {},
  }
}

function mapShowcaseRow(row) {
  const showcaseObject = {
    color: row.color,
    description: row.description,
    id: row.id,
    isPublished: row.is_published,
    texture: row.texture,
    title: row.title,
  }

  return {
    ...showcaseObject,
    coverImagePath: resolveShowcaseImagePath(row.cover_image_path, showcaseObject),
  }
}

function mapContactsRow(row) {
  return {
    phone: row.phone,
    whatsappUrl: row.whatsapp_url,
    telegramUrl: row.telegram_url,
    maxUrl: row.max_url ?? '',
    vkUrl: row.vk_url,
    address: row.address,
    workingHours: row.working_hours,
  }
}

export async function getSiteContentBundle() {
  await ensureContactsSchemaCompatibility()
  await ensureShowcaseObjectsCompatibility()

  const [contactsResult, blocksResult, showcaseResult] = await Promise.all([
    query(
      `
        SELECT
          phone,
          whatsapp_url,
          telegram_url,
          max_url,
          vk_url,
          address,
          working_hours
        FROM contacts
        WHERE id = 1
      `
    ),
    query(
      `
        SELECT
          block_key,
          title,
          subtitle,
          body,
          cta_label,
          cta_link,
          extra_data_json
        FROM site_content
        ORDER BY block_key
      `
    ),
    query(
      `
        SELECT
          title,
          texture,
          color,
          description,
          cover_image_path,
          is_published
        FROM showcase_objects
        WHERE is_published = TRUE
        ORDER BY id
      `
    ),
  ])

  const contacts = contactsResult.rows[0]
    ? mapContactsRow(contactsResult.rows[0])
    : null

  return {
    contacts,
    blocks: blocksResult.rows.map(mapBlockRow),
    showcaseObjects: showcaseResult.rows.map(mapShowcaseRow),
  }
}

export async function listSiteContentBlocks() {
  const result = await query(
    `
      SELECT
        block_key,
        title,
        subtitle,
        body,
        cta_label,
        cta_link,
        extra_data_json
      FROM site_content
      ORDER BY block_key
    `
  )

  return result.rows.map(mapBlockRow)
}

export async function findSiteContentBlock(blockKey) {
  const result = await query(
    `
      SELECT
        block_key,
        title,
        subtitle,
        body,
        cta_label,
        cta_link,
        extra_data_json
      FROM site_content
      WHERE block_key = $1
      LIMIT 1
    `,
    [blockKey]
  )

  return result.rows[0] ? mapBlockRow(result.rows[0]) : null
}

export async function upsertSiteContentBlock(block) {
  const result = await query(
    `
      INSERT INTO site_content (
        block_key,
        title,
        subtitle,
        body,
        cta_label,
        cta_link,
        extra_data_json
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (block_key)
      DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        body = EXCLUDED.body,
        cta_label = EXCLUDED.cta_label,
        cta_link = EXCLUDED.cta_link,
        extra_data_json = EXCLUDED.extra_data_json
      RETURNING
        block_key,
        title,
        subtitle,
        body,
        cta_label,
        cta_link,
        extra_data_json
    `,
    [
      block.blockKey,
      block.title,
      block.subtitle,
      block.body,
      block.ctaLabel,
      block.ctaLink,
      JSON.stringify(block.extraData),
    ]
  )

  return mapBlockRow(result.rows[0])
}

export async function listShowcaseObjects({ includeUnpublished = true } = {}) {
  await ensureShowcaseObjectsCompatibility()

  const result = await query(
    `
      SELECT
        id,
        title,
        texture,
        color,
        description,
        cover_image_path,
        is_published
      FROM showcase_objects
      WHERE ($1::boolean = TRUE OR is_published = TRUE)
      ORDER BY id
    `,
    [includeUnpublished]
  )

  return result.rows.map(mapShowcaseRow)
}

export async function createShowcaseObject(object) {
  const result = await query(
    `
      INSERT INTO showcase_objects (
        title,
        texture,
        color,
        description,
        cover_image_path,
        is_published
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        title,
        texture,
        color,
        description,
        cover_image_path,
        is_published
    `,
    [
      object.title,
      object.texture,
      object.color,
      object.description,
      object.coverImagePath,
      object.isPublished,
    ]
  )

  return mapShowcaseRow(result.rows[0])
}

export async function updateShowcaseObject(id, object) {
  const result = await query(
    `
      UPDATE showcase_objects
      SET
        title = $2,
        texture = $3,
        color = $4,
        description = $5,
        cover_image_path = $6,
        is_published = $7
      WHERE id = $1
      RETURNING
        id,
        title,
        texture,
        color,
        description,
        cover_image_path,
        is_published
    `,
    [
      id,
      object.title,
      object.texture,
      object.color,
      object.description,
      object.coverImagePath,
      object.isPublished,
    ]
  )

  return result.rows[0] ? mapShowcaseRow(result.rows[0]) : null
}

export async function deleteShowcaseObject(id) {
  const result = await query(
    `
      DELETE FROM showcase_objects
      WHERE id = $1
    `,
    [id]
  )

  return result.rowCount > 0
}

export async function getContacts() {
  await ensureContactsSchemaCompatibility()

  const result = await query(
    `
      SELECT
        phone,
        whatsapp_url,
        telegram_url,
        max_url,
        vk_url,
        address,
        working_hours
      FROM contacts
      WHERE id = 1
    `
  )

  return result.rows[0] ? mapContactsRow(result.rows[0]) : null
}

export async function upsertContacts(contacts) {
  await ensureContactsSchemaCompatibility()

  const result = await query(
    `
      INSERT INTO contacts (
        id,
        phone,
        whatsapp_url,
        telegram_url,
        max_url,
        vk_url,
        address,
        working_hours
      )
      VALUES (1, $1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id)
      DO UPDATE SET
        phone = EXCLUDED.phone,
        whatsapp_url = EXCLUDED.whatsapp_url,
        telegram_url = EXCLUDED.telegram_url,
        max_url = EXCLUDED.max_url,
        vk_url = EXCLUDED.vk_url,
        address = EXCLUDED.address,
        working_hours = EXCLUDED.working_hours
      RETURNING
        phone,
        whatsapp_url,
        telegram_url,
        max_url,
        vk_url,
        address,
        working_hours
    `,
    [
      contacts.phone,
      contacts.whatsappUrl,
      contacts.telegramUrl,
      contacts.maxUrl,
      contacts.vkUrl,
      contacts.address,
      contacts.workingHours,
    ]
  )

  return mapContactsRow(result.rows[0])
}
