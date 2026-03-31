import { query, withTransaction } from '../db/pool.js'
import { resolveProductImagePath } from '../data/runtimeContentLayer.js'

const productSelectSql = `
  SELECT
    p.id,
    p.slug,
    p.name,
    p.texture,
    p.brick_color,
    p.joint_color,
    p.thickness,
    p.panel_area,
    p.price_current,
    p.price_old,
    p.availability_status,
    p.short_description,
    p.full_description,
    p.is_hidden,
    COALESCE(
      json_agg(
        json_build_object(
          'id', pi.id,
          'image', pi.image_path,
          'alt', pi.alt_text,
          'kind', pi.image_type,
          'note', pi.caption,
          'sortOrder', pi.sort_order
        )
        ORDER BY pi.sort_order, pi.id
      ) FILTER (WHERE pi.id IS NOT NULL),
      '[]'::json
    ) AS gallery
  FROM products p
  LEFT JOIN product_images pi ON pi.product_id = p.id
`

function mapProductRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    texture: row.texture,
    brickColor: row.brick_color,
    jointColor: row.joint_color,
    thickness: row.thickness,
    panelArea: Number(row.panel_area),
    priceCurrent: Number(row.price_current),
    priceOld: row.price_old === null ? null : Number(row.price_old),
    availabilityStatus: row.availability_status,
    shortDescription: row.short_description,
    fullDescription: row.full_description,
    isHidden: row.is_hidden,
    gallery: (row.gallery ?? []).map((image) => ({
      id: image.id,
      image: resolveProductImagePath(image.image, image.kind, {
        productSlug: row.slug,
        sortOrder: Number(image.sortOrder),
      }),
      alt: image.alt,
      kind: image.kind,
      note: image.note,
      sortOrder: Number(image.sortOrder),
    })),
  }
}

async function findOne(whereSql, params) {
  const result = await query(
    `
      ${productSelectSql}
      ${whereSql}
      GROUP BY p.id
      LIMIT 1
    `,
    params
  )

  return result.rows[0] ? mapProductRow(result.rows[0]) : null
}

export async function listProducts({ includeHidden = false } = {}) {
  const result = await query(
    `
      ${productSelectSql}
      WHERE ($1::boolean = TRUE OR p.is_hidden = FALSE)
      GROUP BY p.id
      ORDER BY p.id
    `,
    [includeHidden]
  )

  return result.rows.map(mapProductRow)
}

export async function findProductBySlug(slug, { includeHidden = false } = {}) {
  return findOne(
    `
      WHERE lower(p.slug) = lower($1)
        AND ($2::boolean = TRUE OR p.is_hidden = FALSE)
    `,
    [slug, includeHidden]
  )
}

export async function findProductById(id, { includeHidden = true } = {}) {
  return findOne(
    `
      WHERE p.id = $1
        AND ($2::boolean = TRUE OR p.is_hidden = FALSE)
    `,
    [id, includeHidden]
  )
}

export async function createProduct(input) {
  return withTransaction(async (client) => {
    const insertResult = await client.query(
      `
        INSERT INTO products (
          slug,
          name,
          texture,
          brick_color,
          joint_color,
          thickness,
          panel_area,
          price_current,
          price_old,
          availability_status,
          short_description,
          full_description,
          is_hidden
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
      `,
      [
        input.slug,
        input.name,
        input.texture,
        input.brickColor,
        input.jointColor,
        input.thickness,
        input.panelArea,
        input.priceCurrent,
        input.priceOld,
        input.availabilityStatus,
        input.shortDescription,
        input.fullDescription,
        input.isHidden,
      ]
    )

    const productResult = await client.query(
      `
        ${productSelectSql}
        WHERE p.id = $1
        GROUP BY p.id
        LIMIT 1
      `,
      [insertResult.rows[0].id]
    )

    return mapProductRow(productResult.rows[0])
  })
}

export async function updateProduct(id, input) {
  return withTransaction(async (client) => {
    const updateResult = await client.query(
      `
        UPDATE products
        SET
          slug = $2,
          name = $3,
          texture = $4,
          brick_color = $5,
          joint_color = $6,
          thickness = $7,
          panel_area = $8,
          price_current = $9,
          price_old = $10,
          availability_status = $11,
          short_description = $12,
          full_description = $13,
          is_hidden = $14
        WHERE id = $1
        RETURNING id
      `,
      [
        id,
        input.slug,
        input.name,
        input.texture,
        input.brickColor,
        input.jointColor,
        input.thickness,
        input.panelArea,
        input.priceCurrent,
        input.priceOld,
        input.availabilityStatus,
        input.shortDescription,
        input.fullDescription,
        input.isHidden,
      ]
    )

    if (updateResult.rowCount === 0) {
      return null
    }

    const productResult = await client.query(
      `
        ${productSelectSql}
        WHERE p.id = $1
        GROUP BY p.id
        LIMIT 1
      `,
      [id]
    )

    return mapProductRow(productResult.rows[0])
  })
}

export async function deleteProduct(id) {
  const result = await query(
    `
      DELETE FROM products
      WHERE id = $1
    `,
    [id]
  )

  return result.rowCount > 0
}

export async function addProductImage(productId, image) {
  return withTransaction(async (client) => {
    const insertResult = await client.query(
      `
        INSERT INTO product_images (
          product_id,
          image_path,
          alt_text,
          image_type,
          sort_order,
          caption
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `,
      [
        productId,
        image.image,
        image.alt,
        image.kind,
        image.sortOrder,
        image.note,
      ]
    )

    const imageResult = await client.query(
      `
        SELECT
          id,
          image_path,
          alt_text,
          image_type,
          sort_order,
          caption
        FROM product_images
        WHERE id = $1
      `,
      [insertResult.rows[0].id]
    )

    const row = imageResult.rows[0]
    return {
      id: row.id,
      image: resolveProductImagePath(row.image_path, row.image_type),
      alt: row.alt_text,
      kind: row.image_type,
      note: row.caption,
      sortOrder: row.sort_order,
    }
  })
}

export async function deleteProductImage(productId, imageId) {
  const result = await query(
    `
      DELETE FROM product_images
      WHERE id = $1 AND product_id = $2
    `,
    [imageId, productId]
  )

  return result.rowCount > 0
}
