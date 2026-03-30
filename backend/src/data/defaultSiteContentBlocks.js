import { publicFallbackAssets } from './runtimeContentLayer.js'

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
  {
    label: 'Написать в WhatsApp',
    href: 'https://wa.me/79097555095',
    variant: 'secondary',
    external: true,
  },
  { label: 'Получить консультацию', href: '#contacts', variant: 'secondary' },
]

export const defaultSiteContentBlocks = [
  {
    blockKey: 'header',
    title: 'Thermal Panels',
    subtitle: 'Утепление и облицовка фасада',
    body: '',
    ctaLabel: 'Рассчитать стоимость',
    ctaLink: '#calculator',
    extraData: {
      brandBadge: 'TP',
      ctaShortLabel: 'Расчёт',
      menuActions: headerMenuActions,
      menuItems: headerMenuItems,
      messengerLabels: {
        telegram: 'TG',
        vk: 'VK',
        whatsapp: 'WA',
      },
      phoneShortLabel: 'Позвонить',
    },
  },
  {
    blockKey: 'hero',
    title: 'Декоративные термопанели для утепления и облицовки фасада',
    subtitle: 'Фасад частного дома без лишних этапов отделки',
    body:
      'Покажем фактуры, подберём сочетание цвета кирпича и шва и быстро дадим предварительный расчёт под ваш фасад.',
    ctaLabel: 'Рассчитать стоимость',
    ctaLink: '#calculator',
    extraData: {
      image: publicFallbackAssets.hero,
      actions: [{ label: 'Рассчитать стоимость', href: '#calculator', variant: 'primary' }],
      highlights: [
        'Три основные фактуры: зернистая, гладкая и клинкерная',
        'Комбинации оттенка панели и цвета шва под архитектуру дома',
        'Производство на оборудовании и заводские клеевые составы',
        'Понятный сценарий: каталог, расчёт, консультация по монтажу',
      ],
    },
  },
  {
    blockKey: 'product-overview',
    title: 'Что важно знать о термопанелях',
    subtitle: '',
    body: '',
    ctaLabel: 'Рассчитать стоимость',
    ctaLink: '#calculator',
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
    title: 'Почему клиенты выбирают такой подход к фасаду',
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
    title: 'Варианты панелей и фасадов',
    subtitle: '',
    body: '',
    ctaLabel: 'Получить каталог',
    ctaLink: '#catalog',
    extraData: {
      cards: [
        {
          image: publicFallbackAssets.galleryGranular,
          meta: 'Фактура панели',
          title: 'Зернистая фактура',
        },
        {
          image: publicFallbackAssets.gallerySmooth,
          meta: 'Фактура панели',
          title: 'Гладкая фактура',
        },
        {
          image: publicFallbackAssets.galleryClinker,
          meta: 'Фактура панели',
          title: 'Клинкерная фактура',
        },
        {
          image: publicFallbackAssets.galleryPalette,
          meta: 'Цветовые решения',
          title: 'Комбинации цвета панели и шва',
        },
        {
          image: publicFallbackAssets.galleryLightFacade,
          meta: 'Подбор цвета',
          title: 'Светлые фасадные решения',
        },
        {
          image: publicFallbackAssets.galleryContrastFacade,
          meta: 'Подбор цвета',
          title: 'Контрастные сочетания',
        },
      ],
      hint: '',
    },
  },
  {
    blockKey: 'catalog',
    title: 'Подберите панель под фасад своего дома',
    subtitle: '',
    body: '',
    ctaLabel: 'Запросить подбор и расчёт',
    ctaLink: '#contacts',
    extraData: {},
  },
  {
    blockKey: 'calculator',
    title: 'Рассчитайте стоимость отделки своего дома',
    subtitle: '',
    body: '',
    ctaLabel: '',
    ctaLink: '',
    extraData: {
      installationOptions: [
        {
          text: 'Показываем ориентир по материалу и количеству панелей.',
          title: 'Самостоятельный монтаж',
          value: 'self',
        },
        {
          text:
            'Фиксируем интерес к монтажу и подсказываем, что работы уточняются отдельно.',
          title: 'Нужен расчёт с монтажом',
          value: 'assisted',
        },
      ],
    },
  },
  {
    blockKey: 'self-install',
    title: 'Монтаж можно выполнить самостоятельно',
    subtitle: '',
    body:
      'Монтаж термопанелей — это понятный и последовательный процесс, который можно выполнить самостоятельно после консультации и расчёта.',
    ctaLabel: 'Получить консультацию',
    ctaLink: '#contacts',
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
    title: 'Сотрудничество для магазинов, бригад и застройщиков',
    subtitle: '',
    body:
      'Работаем с партнёрами, которым важно стабильное качество, понятные условия и предсказуемый результат на объектах.',
    ctaLabel: 'Связаться',
    ctaLink: '#contacts',
    extraData: {
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
    title: 'Свяжитесь удобным способом',
    subtitle: '',
    body: '',
    ctaLabel: '',
    ctaLink: '',
    extraData: {
      channels: [
        {
          actionLabel: 'Позвонить',
          description: 'Быстрый звонок для расчёта и обсуждения фасада.',
          key: 'phone',
          label: 'Телефон',
        },
        {
          actionLabel: 'Написать в WhatsApp',
          description: 'Можно отправить фото дома и быстро уточнить детали.',
          key: 'whatsapp',
          label: 'WhatsApp',
          value: 'Написать в WhatsApp',
        },
        {
          actionLabel: 'Написать в Telegram',
          description: 'Удобно для переписки и уточнения деталей.',
          key: 'telegram',
          label: 'Telegram',
          value: 'Написать в Telegram',
        },
        {
          actionLabel: 'Открыть VK',
          description: 'Можно посмотреть обновления и связаться удобным способом.',
          key: 'vk',
          label: 'VK',
          value: 'Перейти во VK',
        },
      ],
    },
  },
  {
    blockKey: 'footer',
    title: 'Thermal Panels',
    subtitle: '',
    body: 'Thermal Panels • фасадные термопанели для утепления и облицовки дома',
    ctaLabel: '',
    ctaLink: '',
    extraData: {
      telegramLabel: 'Telegram',
      vkLabel: 'VK',
      whatsappLabel: 'WhatsApp',
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
