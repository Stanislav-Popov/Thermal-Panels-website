import {
  defaultContactChannelConfigs,
  sectionTextDefaults,
} from './siteTextDefaults.js'
import { defaultShowcaseObjects } from '../../../shared/defaultShowcaseObjects.js'

export const placeholderImage = '/media/content/hero-block.webp'

export const menuItems = [
  { label: 'Преимущества', href: '#benefits' },
  { label: 'Почему мы', href: '#why-us' },
  { label: 'Каталог', href: '#catalog' },
  { label: 'Калькулятор', href: '#calculator' },
  { label: 'Монтаж', href: '#self-install' },
  { label: 'Партнёрам', href: '#partners' },
  { label: 'Контакты', href: '#contacts' },
]

export const headerContacts = {
  maxHref: '',
  phoneLabel: '+7 (909) 755-50-95',
  phoneHref: 'tel:+79097555095',
  whatsappHref: 'https://wa.me/79097555095',
  telegramHref: '',
  vkHref: '',
}

export const menuActions = [
  { label: 'Рассчитать стоимость', href: '#calculator', variant: 'primary' },
  { label: 'Получить каталог', href: '#catalog', variant: 'secondary' },
  { label: 'Получить консультацию', href: '#contacts', variant: 'secondary' },
]

export const materialOverview = [
  'Материал помогает снизить теплопотери дома и дополнительно уменьшает уровень внешнего шума. При этом фасад получает защиту от внешних воздействий и сохраняет внешний вид на долгий срок.',
]

export const materialComposition = []

export const comparisonColumns = [
  {
    variant: 'muted',
    title: 'Как часто бывает на рынке',
    points: [
      'Производство на самодельных столах без стабильной геометрии.',
      'Неровные панели, из-за которых усложняется монтаж.',
      'Использование клеевых составов сомнительного качества.',
      'Оттенки «на глаз», без системного подбора.',
      'Разные партии могут отличаться по цвету.',
      'Визуально фасад получается неровным и дешёвым.',
      'После монтажа могут проявляться дефекты и расхождения.',
    ],
  },
  {
    variant: 'accent',
    title: 'Как делаем мы',
    points: [
      'Производство на оборудовании — стабильная геометрия каждой панели.',
      'Панели аккуратно стыкуются и выглядят ровно на фасаде.',
      'Используем заводские клеевые составы проверенных производителей.',
      'Контроль на этапах производства.',
      'Оттенки и сочетания подбираются с участием колористов.',
      'Цвета выглядят естественно и сочетаются с архитектурой дома.',
      'Предсказуемый результат: фасад выглядит аккуратно сразу после монтажа.',
    ],
  },
]

export const materialFeature = {
  image: '/media/content/What-is-important-to-know-about-thermalpanels-block.webp',
  title: 'Термопанели для тёплого и аккуратного фасада',
  text: 'Термопанели — это решение, которое сразу закрывает два ключевых вопроса фасада: утепление и внешний вид дома. Вместо нескольких этапов работ вы получаете понятный и предсказуемый результат — тёплый и аккуратный фасад.',
}

export const partnerDescription = sectionTextDefaults.partners.description

export const partnerOptions = [
  {
    title: 'Для кого подойдёт',
    text: 'Строительным магазинам, монтажным бригадам, прорабам и застройщикам частных домов.',
  },
  {
    title: 'Что вы получаете',
    text: 'Оптовые условия и более выгодную цену, стабильное качество панелей от партии к партии, понятную геометрию без проблем при монтаже, поддержку при расчётах под объекты, консультации по материалу и монтажу, материал, за который не стыдно перед клиентом.',
  },
  {
    title: 'Форматы работы',
    text: 'Поставка панелей под ваши объекты, регулярные закупки для магазинов, работа с бригадами и частными застройщиками, индивидуальные условия при объёмах. Напишите или позвоните — обсудим условия и подберём формат сотрудничества под ваши задачи.',
  },
]

export const productDescriptionBlocks = [
  {
    title: 'Подбор под архитектуру дома',
    text: 'Вы можете выбрать фактуру панели — зернистую, гладкую или клинкерную — а также подобрать сочетание цвета панели и шва под архитектуру дома. Оттенки подбираются с учётом визуального восприятия фасада, чтобы дом выглядел цельно и аккуратно.',
  },
  {
    title: 'Почему важно качество производства',
    text: 'Важно учитывать не только внешний вид, но и качество производства. Стабильная геометрия панелей, использование заводских клеевых составов и контроль на этапе изготовления напрямую влияют на итоговый результат на фасаде.',
  },
  {
    title: 'Для нового дома и обновления фасада',
    text: 'Термопанели подходят как для нового строительства, так и для обновления уже существующего дома. При этом монтаж можно выполнить самостоятельно или с расчётом под работу бригады — в зависимости от задачи.',
  },
]

export const selfInstallContent = {
  body: sectionTextDefaults.selfInstall.body,
  image: '/media/fallback/self-install-scene.svg',
  mediaText:
    'После покупки вы получите видеоинструкцию с практическими рекомендациями и нюансами монтажа, которые часто упускают с первого раза.',
  points: [
    'Мы заранее объясняем, как рассчитать материал, где учитывать подрезку и в какой последовательности выполнять работы. Это позволяет спокойно оценить объём и избежать лишних затрат.',
    'Установка не требует сложного оборудования — достаточно базового инструмента и аккуратного подхода.',
    'После покупки вы получите видеоинструкцию с практическими рекомендациями и нюансами, которые обычно не учитывают с первого раза.',
  ],
  videoLabel: 'Видео по самостоятельному монтажу',
}

const contactChannelHrefMap = {
  phone: headerContacts.phoneHref,
  max: '',
  telegram: headerContacts.telegramHref,
  vk: headerContacts.vkHref,
  whatsapp: headerContacts.whatsappHref,
}

const contactChannelValueMap = {
  phone: headerContacts.phoneLabel,
  max: 'Написать в Max',
  telegram: 'Написать в Telegram',
  vk: 'Перейти во VK',
  whatsapp: 'Написать в WhatsApp',
}

export const projectExamples = defaultShowcaseObjects.map((item) => ({
  color: item.color,
  image: item.coverImagePath,
  note: item.description,
  texture: item.texture,
  title: item.title,
}))

export const contactChannels = defaultContactChannelConfigs
  .map((channel) => {
    const href = contactChannelHrefMap[channel.key] ?? ''

    if (!href) {
      return null
    }

    return {
      ...channel,
      href,
      value: channel.value ?? contactChannelValueMap[channel.key] ?? '',
    }
  })
  .filter(Boolean)
