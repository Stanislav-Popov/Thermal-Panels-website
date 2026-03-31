const genericPrimaryFields = [
  { label: 'Заголовок', name: 'title' },
  { label: 'Подзаголовок', name: 'subtitle' },
  { label: 'Текст', multiline: true, name: 'body' },
  { label: 'Текст CTA', name: 'ctaLabel' },
  { label: 'Ссылка CTA', name: 'ctaLink' },
]

export const contentBlockEditorMeta = {
  header: {
    description:
      'Логотип, подпись бренда, навигация и быстрые CTA в фиксированной шапке сайта.',
    label: 'Header',
    primaryFields: [
      { label: 'Название бренда', name: 'title' },
      { label: 'Подпись под брендом', name: 'subtitle' },
      { label: 'Текст главной кнопки', name: 'ctaLabel' },
      { label: 'Ссылка главной кнопки', name: 'ctaLink' },
    ],
  },
  hero: {
    description:
      'Первый экран: крупный заголовок, текст над ним, текст под ним, главное изображение и одна основная CTA-кнопка.',
    label: 'Первый экран',
    primaryFields: [
      { label: 'Крупный заголовок', name: 'title' },
      { label: 'Текст над заголовком', name: 'subtitle' },
      { label: 'Текст под заголовком', multiline: true, name: 'body' },
      { label: 'Текст кнопки', name: 'ctaLabel' },
      { label: 'Ссылка кнопки', name: 'ctaLink' },
    ],
  },
  'product-overview': {
    description:
      'Описание материала, состав, ключевые тезисы и блок с главным изображением.',
    label: 'Описание продукта',
    primaryFields: [
      { label: 'Заголовок', name: 'title' },
      { label: 'Подзаголовок секции', name: 'subtitle' },
      { label: 'Вводный текст', multiline: true, name: 'body' },
      { label: 'Текст CTA', name: 'ctaLabel' },
      { label: 'Ссылка CTA', name: 'ctaLink' },
    ],
  },
  'why-us': {
    description:
      'Сравнительный блок с двумя колонками: как часто бывает на рынке и как работает компания.',
    label: 'Почему мы',
    primaryFields: [
      { label: 'Заголовок', name: 'title' },
      { label: 'Подзаголовок', name: 'subtitle' },
      { label: 'Короткое описание', multiline: true, name: 'body' },
    ],
  },
  gallery: {
    description:
      'Блок "Примеры работ". Карточки берутся из опубликованных объектов во вкладке "Объекты", а здесь настраиваются только тексты секции.',
    label: 'Примеры работ',
    primaryFields: [
      { label: 'Заголовок', name: 'title' },
      { label: 'Подзаголовок', name: 'subtitle' },
      { label: 'Описание секции', multiline: true, name: 'body' },
      { label: 'Текст кнопки под галереей', name: 'ctaLabel' },
      { label: 'Ссылка кнопки под галереей', name: 'ctaLink' },
    ],
  },
  catalog: {
    description:
      'Вступительный текст перед каталогом товаров и верхняя CTA-кнопка над карточками.',
    label: 'Каталог',
    primaryFields: [
      { label: 'Заголовок', name: 'title' },
      { label: 'Подзаголовок', name: 'subtitle' },
      { label: 'Описание каталога', multiline: true, name: 'body' },
      { label: 'Текст верхней CTA', name: 'ctaLabel' },
      { label: 'Ссылка верхней CTA', name: 'ctaLink' },
    ],
  },
  calculator: {
    description:
      'Простой калькулятор с выбором панели, вводом площади и мгновенным результатом.',
    label: 'Калькулятор',
    primaryFields: [
      { label: 'Заголовок', name: 'title' },
    ],
  },
  'self-install': {
    description:
      'Блок о самостоятельном монтаже: обложка, подпись поверх изображения, тезисы и CTA.',
    label: 'Самостоятельный монтаж',
    primaryFields: [
      { label: 'Заголовок', name: 'title' },
      { label: 'Подзаголовок', name: 'subtitle' },
      { label: 'Основной текст секции', multiline: true, name: 'body' },
      { label: 'Текст CTA', name: 'ctaLabel' },
      { label: 'Ссылка CTA', name: 'ctaLink' },
    ],
  },
  partners: {
    description:
      'Оффер для магазинов, бригад, прорабов и частных застройщиков.',
    label: 'Партнёрам',
    primaryFields: [
      { label: 'Заголовок', name: 'title' },
      { label: 'Подзаголовок', name: 'subtitle' },
      { label: 'Вводный текст', multiline: true, name: 'body' },
      { label: 'Текст CTA', name: 'ctaLabel' },
      { label: 'Ссылка CTA', name: 'ctaLink' },
    ],
  },
  contacts: {
    description:
      'Заголовок секции, вводный текст и порядок каналов связи. Сами ссылки меняются во вкладке "Контакты".',
    label: 'Контакты',
    primaryFields: [
      { label: 'Заголовок', name: 'title' },
      { label: 'Подзаголовок', name: 'subtitle' },
      { label: 'Описание секции', multiline: true, name: 'body' },
    ],
  },
  footer: {
    description:
      'Подпись в футере и короткие названия для быстрых кнопок мессенджеров.',
    label: 'Footer',
    primaryFields: [
      { label: 'Подпись в футере', multiline: true, name: 'body' },
    ],
  },
}

export function getContentBlockEditorMeta(blockKey) {
  return (
    contentBlockEditorMeta[blockKey] ?? {
      description:
        'Редактирование текста и дополнительных JSON-настроек секции.',
      label: blockKey || 'Контентный блок',
      primaryFields: genericPrimaryFields,
    }
  )
}

export function supportsStructuredContentEditor(blockKey) {
  return Object.hasOwn(contentBlockEditorMeta, blockKey)
}
