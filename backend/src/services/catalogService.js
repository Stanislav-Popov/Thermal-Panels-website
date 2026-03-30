import {
  findProductBySlug,
  listProducts,
} from '../repositories/productRepository.js'

function calculateDiscount(product) {
  if (!product.priceOld || product.priceOld <= product.priceCurrent) {
    return null
  }

  return Math.round(
    ((product.priceOld - product.priceCurrent) / product.priceOld) * 100
  )
}

function mapPublicProduct(product) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    texture: product.texture,
    brickColor: product.brickColor,
    jointColor: product.jointColor,
    thickness: product.thickness,
    panelArea: product.panelArea,
    priceCurrent: product.priceCurrent,
    priceOld: product.priceOld,
    discountPercent: calculateDiscount(product),
    availabilityStatus: product.availabilityStatus,
    shortDescription: product.shortDescription,
    fullDescription: product.fullDescription,
    gallery: product.gallery,
  }
}

export async function listPublicProducts() {
  const products = await listProducts()
  return products.map(mapPublicProduct)
}

export async function getPublicProductBySlug(slug) {
  const product = await findProductBySlug(slug)
  return product ? mapPublicProduct(product) : null
}
