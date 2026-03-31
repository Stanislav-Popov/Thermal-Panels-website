import { publicFallbackAssets } from './runtimeContentLayer.js'
import {
  defaultContactChannelConfigs,
  sectionTextDefaults,
} from '../../../shared/siteTextDefaults.js'

const headerMenuItems = [
  { label: 'Преимущества', href: '#benefits' },
  { label: 'Почему мы', href: '#why-us' },
  { label: 'Каталог', href: '#catalog' },
  { label: 'Калькулятор', href: '#calculator' },
  { label: 'Монтаж', href: '#self-install' },
  { label: 'Партнёрам', href: '#partners' },
  { label: 'Контакты', href: '#contacts' },
]

const headerMenuActions = [
  { label: 'Рассчитать стоимость', href: '#calculator', variant: 'primary' },
  { label: 'Получить каталог', href: '#catalog', variant: 'secondary' },
  { label: 'Получить консультацию', href: '#contacts', variant: 'secondary' },
]

export const defaultSiteContentBlocks = [
  {
    blockKey: 'header',
    title: sectionTextDefaults.header.brandTitle,
    subtitle: sectionTextDefaults.header.brandSubtitle,
    body: '',
    ctaLabel: sectionTextDefaults.header.ctaLabel,
    ctaLink: sectionTextDefaults.header.ctaHref,
    extraData: {
      brandBadge: sectionTextDefaults.header.brandBadge,
      ctaShortLabel: sectionTextDefaults.header.ctaShortLabel,
      menuActions: headerMenuActions,
      menuItems: headerMenuItems,
      messengerLabels: sectionTextDefaults.header.messengerLabels,
      phoneShortLabel: sectionTextDefaults.header.phoneShortLabel,
    },
  },
  {
    blockKey: 'hero',
    title: sectionTextDefaults.hero.title,
    subtitle: sectionTextDefaults.hero.subtitle,
    body: sectionTextDefaults.hero.body,
    ctaLabel: sectionTextDefaults.hero.ctaLabel,
    ctaLink: sectionTextDefaults.hero.ctaHref,
    extraData: {
      image: publicFallbackAssets.hero,
    },
  },
  {
    blockKey: 'product-overview',
    title: sectionTextDefaults.productOverview.title,
    subtitle: '',
    body: '',
    ctaLabel: sectionTextDefaults.productOverview.ctaLabel,
    ctaLink: sectionTextDefaults.productOverview.ctaHref,
    extraData: {
      badges: [],
      blocks: [
        {
          title: 'Подбор под архитектуру дома',
          text:
            'Вы можете выбрать фактуру панели — зернистую, гладкую или клинкерную — а также подобрать сочетание цвета панели и шва под архитектуру дома. Оттенки подбираются с учётом визуального восприятия фасада, чтобы дом выглядел цельно и аккуратно.',
        },
        {
          title: 'Почему важно качество производства',
          text:
            'Важно учитывать не только внешний вид, но и качество производства. Стабильная геометрия панелей, использование заводских клеевых составов и контроль на этапе изготовления напрямую влияют на итоговый результат на фасаде.',
        },
        {
          title: 'Для нового дома и обновления фасада',
          text:
            'Термопанели подходят как для нового строительства, так и для обновления уже существующего дома. При этом монтаж можно выполнить самостоятельно или с расчётом под работу бригады — в зависимости от задачи.',
        },
      ],
      composition: [],
      featureImage: publicFallbackAssets.productFeature,
      featureText:
        'Термопанели — это решение, которое сразу закрывает два ключевых вопроса фасада: утепление и внешний вид дома. Вместо нескольких этапов работ вы получаете понятный и предсказуемый результат — тёплый и аккуратный фасад.',
      featureTitle: 'Термопанели для тёплого и аккуратного фасада',
      overview: [
        'Материал помогает снизить теплопотери дома и дополнительно уменьшает уровень внешнего шума. При этом фасад получает защиту от внешних воздействий и сохраняет внешний вид на долгий срок.',
      ],
    },
  },
  {
    blockKey: 'why-us',
    title: sectionTextDefaults.whyUs.title,
    subtitle: '',
    body: '',
    ctaLabel: '',
    ctaLink: '',
    extraData: {
      columns: [
        {
          points: [
            'Производство на самодельных столах без стабильной геометрии.',
            'Неровные панели, из-за которых усложняется монтаж.',
            'Использование клеевых составов сомнительного качества.',
            'Оттенки «на глаз», без системного подбора.',
            'Разные партии могут отличаться по цвету.',
            'Визуально фасад получается неровным и дешёвым.',
            'После монтажа могут проявляться дефекты и расхождения.',
          ],
          title: 'Как часто бывает на рынке',
          variant: 'muted',
        },
        {
          points: [
            'Производство на оборудовании — стабильная геометрия каждой панели.',
            'Панели аккуратно стыкуются и выглядят ровно на фасаде.',
            'Используем заводские клеевые составы проверенных производителей.',
            'Контроль на этапах производства.',
            'Оттенки и сочетания подбираются с участием колористов.',
            'Цвета выглядят естественно и сочетаются с архитектурой дома.',
            'Предсказуемый результат: фасад выглядит аккуратно сразу после монтажа.',
          ],
          title: 'Как делаем мы',
          variant: 'accent',
        },
      ],
    },
  },
  {
    blockKey: 'gallery',
    title: sectionTextDefaults.gallery.title,
    subtitle: '',
    body: '',
    ctaLabel: sectionTextDefaults.gallery.ctaLabel,
    ctaLink: sectionTextDefaults.gallery.ctaHref,
    extraData: {
      hint: '',
    },
  },
  {
    blockKey: 'catalog',
    title: sectionTextDefaults.catalog.title,
    subtitle: '',
    body: '',
    ctaLabel: sectionTextDefaults.catalog.ctaLabel,
    ctaLink: sectionTextDefaults.catalog.ctaHref,
    extraData: {},
  },
  {
    blockKey: 'calculator',
    title: sectionTextDefaults.calculator.title,
    subtitle: '',
    body: '',
    ctaLabel: '',
    ctaLink: '',
    extraData: {},
  },
  {
    blockKey: 'self-install',
    title: sectionTextDefaults.selfInstall.title,
    subtitle: '',
    body: sectionTextDefaults.selfInstall.body,
    ctaLabel: sectionTextDefaults.selfInstall.ctaLabel,
    ctaLink: sectionTextDefaults.selfInstall.ctaHref,
    extraData: {
      image: publicFallbackAssets.selfInstall,
      mediaText:
        'После покупки вы получите видеоинструкцию с практическими рекомендациями и нюансами монтажа, которые часто упускают с первого раза.',
      points: [
        'Мы заранее объясняем, как рассчитать материал, где учитывать подрезку и в какой последовательности выполнять работы. Это позволяет спокойно оценить объём и избежать лишних затрат.',
        'Установка не требует сложного оборудования — достаточно базового инструмента и аккуратного подхода.',
        'После покупки вы получите видеоинструкцию с практическими рекомендациями и нюансами, которые обычно не учитывают с первого раза.',
      ],
      videoLabel: 'Видео по самостоятельному монтажу',
    },
  },
  {
    blockKey: 'partners',
    title: sectionTextDefaults.partners.title,
    subtitle: '',
    body: sectionTextDefaults.partners.description,
    ctaLabel: sectionTextDefaults.partners.ctaLabel,
    ctaLink: sectionTextDefaults.partners.ctaHref,
    extraData: {
      leadBadge: sectionTextDefaults.partners.leadBadge,
      leadTitle: sectionTextDefaults.partners.leadTitle,
      options: [
        {
          text:
            'Строительным магазинам, монтажным бригадам, прорабам и застройщикам частных домов.',
          title: 'Для кого подойдёт',
        },
        {
          text:
            'Оптовые условия и более выгодную цену, стабильное качество панелей от партии к партии, понятную геометрию без проблем при монтаже, поддержку при расчётах под объекты, консультации по материалу и монтажу, материал, за который не стыдно перед клиентом.',
          title: 'Что вы получаете',
        },
        {
          text:
            'Поставка панелей под ваши объекты, регулярные закупки для магазинов, работа с бригадами и частными застройщиками, индивидуальные условия при объёмах. Напишите или позвоните — обсудим условия и подберём формат сотрудничества под ваши задачи.',
          title: 'Форматы работы',
        },
      ],
    },
  },
  {
    blockKey: 'contacts',
    title: sectionTextDefaults.contacts.title,
    subtitle: '',
    body: '',
    ctaLabel: '',
    ctaLink: '',
    extraData: {
      channels: defaultContactChannelConfigs,
      introEyebrow: sectionTextDefaults.contacts.introEyebrow,
      introText: sectionTextDefaults.contacts.introText,
    },
  },
  {
    blockKey: 'footer',
    title: sectionTextDefaults.header.brandTitle,
    subtitle: '',
    body: sectionTextDefaults.footer.copy,
    ctaLabel: '',
    ctaLink: '',
    extraData: {
      maxLabel: sectionTextDefaults.footer.maxLabel,
      telegramLabel: sectionTextDefaults.footer.telegramLabel,
      vkLabel: sectionTextDefaults.footer.vkLabel,
      whatsappLabel: sectionTextDefaults.footer.whatsappLabel,
    },
  },
]

export function findDefaultSiteContentBlock(blockKey) {
  return (
    defaultSiteContentBlocks.find((block) => block.blockKey === blockKey) ?? null
  )
}

export function mergeWithDefaultSiteContentBlocks(blocks) {
  const existingBlocks = new Map(blocks.map((block) => [block.blockKey, block]))

  const mergedBlocks = defaultSiteContentBlocks.map((defaultBlock) => {
    const storedBlock = existingBlocks.get(defaultBlock.blockKey)

    if (!storedBlock) {
      return defaultBlock
    }

    return {
      ...defaultBlock,
      ...storedBlock,
      extraData: {
        ...defaultBlock.extraData,
        ...(storedBlock.extraData ?? {}),
      },
    }
  })

  for (const block of blocks) {
    if (!defaultSiteContentBlocks.some((item) => item.blockKey === block.blockKey)) {
      mergedBlocks.push(block)
    }
  }

  return mergedBlocks
}
