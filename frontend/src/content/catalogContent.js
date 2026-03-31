const productImages = {
  'clinker-graphite-ice': {
    closeup: '/media/products/product-3/product-3-2.webp',
    facade: '/media/products/product-3/product-3-4.webp',
    far: '/media/products/product-3/product-3-1.webp',
    side: '/media/products/product-3/product-3-3.webp',
  },
  'granit-light-sand': {
    closeup: '/media/products/product-1/product-1-2.webp',
    facade: '/media/products/product-1/product-1-4.webp',
    far: '/media/products/product-1/product-1-1.webp',
    side: '/media/products/product-1/product-1-3.webp',
  },
  'smooth-milk-graphite': {
    closeup: '/media/products/product-2/product-2-2.webp',
    facade: '/media/products/product-2/product-2-4.webp',
    far: '/media/products/product-2/product-2-1.webp',
    side: '/media/products/product-2/product-2-3.webp',
  },
  'smooth-warm-stone': {
    closeup: '/media/products/product-4/product-4-2.webp',
    facade: '/media/products/product-4/product-4-4.webp',
    far: '/media/products/product-4/product-4-1.webp',
    side: '/media/products/product-4/product-4-3.webp',
  },
}

function createGallery(slug, name, textureLabel, facadeLabel) {
  const galleryImages = productImages[slug]

  return [
    {
      image: galleryImages.far,
      alt: `${name}: общий вид панели`,
      kind: 'Панель издалека',
      note: `${textureLabel}, основной тон панели`,
    },
    {
      image: galleryImages.closeup,
      alt: `${name}: крупный план фактуры`,
      kind: 'Крупный план',
      note: `Фактура ${textureLabel.toLowerCase()} и рисунок шва`,
    },
    {
      image: galleryImages.side,
      alt: `${name}: толщина панели`,
      kind: 'Вид сбоку',
      note: `Толщина и слои панели для ${textureLabel.toLowerCase()}`,
    },
    {
      image: galleryImages.facade,
      alt: `${name}: пример фасада дома`,
      kind: 'Фасад дома',
      note: facadeLabel,
    },
  ]
}

export const catalogProducts = [
  {
    slug: 'granit-light-sand',
    name: 'Термопанель Granit Light Sand',
    texture: 'Зернистая',
    brickColor: 'Песочный кирпич',
    jointColor: 'Светло-серый шов',
    thickness: '50 мм',
    panelArea: 0.56,
    priceCurrent: 3350,
    priceOld: 3790,
    availabilityStatus: 'В наличии',
    shortDescription:
      'Спокойный светлый вариант для частных домов с мягкой зернистой фактурой.',
    fullDescription:
      'Подходит для фасадов, где нужен тёплый и аккуратный внешний вид без резкого контраста. Зернистая поверхность помогает сделать рисунок фасада более мягким, а светлый шов подчёркивает кладку без перегруза.',
    gallery: createGallery(
      'granit-light-sand',
      'Термопанель Granit Light Sand',
      'Зернистая',
      'Светлый фасад для спокойных архитектурных решений'
    ),
  },
  {
    slug: 'smooth-milk-graphite',
    name: 'Термопанель Smooth Milk Graphite',
    texture: 'Гладкая',
    brickColor: 'Молочный кирпич',
    jointColor: 'Графитовый шов',
    thickness: '40 мм',
    panelArea: 0.52,
    priceCurrent: 3490,
    priceOld: 3980,
    availabilityStatus: 'В наличии',
    shortDescription:
      'Гладкая панель с контрастным швом для более современного и чистого фасада.',
    fullDescription:
      'Этот вариант подойдёт для домов, где хочется получить аккуратный рисунок кирпича и чуть более современный характер фасада. Контрастный шов делает раскладку выразительнее, а светлый кирпич сохраняет ощущение лёгкости.',
    gallery: createGallery(
      'smooth-milk-graphite',
      'Термопанель Smooth Milk Graphite',
      'Гладкая',
      'Контрастный фасад с современной подачей и ровной геометрией'
    ),
  },
  {
    slug: 'clinker-graphite-ice',
    name: 'Термопанель Clinker Graphite Ice',
    texture: 'Клинкерная',
    brickColor: 'Графитовый кирпич',
    jointColor: 'Светлый шов',
    thickness: '60 мм',
    panelArea: 0.58,
    priceCurrent: 3890,
    priceOld: 0,
    availabilityStatus: 'Под заказ',
    shortDescription:
      'Выразительная клинкерная фактура для контрастных фасадов и заметного рисунка.',
    fullDescription:
      'Клинкерная фактура даёт более активный рельеф и подчёркнутый рисунок кладки. Такой вариант обычно выбирают, когда фасаду нужен выраженный контраст и более собранный визуальный ритм.',
    gallery: createGallery(
      'clinker-graphite-ice',
      'Термопанель Clinker Graphite Ice',
      'Клинкерная',
      'Контрастный фасад с заметным рельефом и светлым швом'
    ),
  },
  {
    slug: 'smooth-warm-stone',
    name: 'Термопанель Smooth Warm Stone',
    texture: 'Гладкая',
    brickColor: 'Тёплый камень',
    jointColor: 'Песочный шов',
    thickness: '50 мм',
    panelArea: 0.54,
    priceCurrent: 3420,
    priceOld: 3650,
    availabilityStatus: 'В наличии',
    shortDescription:
      'Тёплая гамма для фасадов, где хочется сохранить мягкий натуральный оттенок.',
    fullDescription:
      'Хорошо смотрится на частных домах с классическими и комбинированными фасадами. Тёплый оттенок панели помогает сделать внешний вид дома спокойным и собранным, а гладкая фактура оставляет рисунок аккуратным.',
    gallery: createGallery(
      'smooth-warm-stone',
      'Термопанель Smooth Warm Stone',
      'Гладкая',
      'Тёплый фасад с натуральной гаммой и мягким швом'
    ),
  },
]
