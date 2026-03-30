TRUNCATE TABLE
  product_images,
  products,
  showcase_objects,
  site_content,
  contacts
RESTART IDENTITY CASCADE;

INSERT INTO contacts (
  id,
  phone,
  whatsapp_url,
  telegram_url,
  vk_url,
  address,
  working_hours
) VALUES (
  1,
  '+7 (909) 755-50-95',
  'https://wa.me/79097555095',
  '',
  '',
  '',
  ''
);

INSERT INTO site_content (
  block_key,
  title,
  subtitle,
  body,
  cta_label,
  cta_link,
  extra_data_json
) VALUES
  (
    'hero',
    'Декоративные термопанели для утепления и облицовки фасада',
    'Фасад частного дома без лишних этапов отделки',
    'Покажем фактуры, подберём сочетание цвета кирпича и шва и быстро дадим предварительный расчёт под ваш фасад.',
    'Рассчитать стоимость',
    '#calculator',
    '{"highlights":["Термопанели для фасада частного дома","Утепление и облицовка в одном решении","Зернистая, гладкая и клинкерная фактура","Комбинации цвета кирпича и шва"]}'::jsonb
  ),
  (
    'partners',
    'Сотрудничество для магазинов, бригад и застройщиков',
    '',
    'Работаем с партнёрами, которым важно стабильное качество, понятные условия и предсказуемый результат на объектах.',
    'Связаться',
    '#contacts',
    '{}'::jsonb
  ),
  (
    'self-install',
    'Монтаж можно выполнить самостоятельно',
    '',
    'Монтаж термопанелей — это понятный и последовательный процесс, который можно выполнить самостоятельно после консультации и расчёта.',
    'Получить консультацию',
    '#contacts',
    '{"videoLabel":"Видео по самостоятельному монтажу"}'::jsonb
  );

INSERT INTO showcase_objects (
  title,
  texture,
  color,
  description,
  cover_image_path,
  is_published
) VALUES
  (
    'Фасад в светлой гамме',
    'Гладкая фактура',
    'Светлый кирпич + светлый шов',
    'Пока на карточке сервисная визуализация. После загрузки реального фото здесь будет готовый объект.',
    '/media/fallback/gallery-light-facade.svg',
    TRUE
  ),
  (
    'Контрастный современный фасад',
    'Клинкерная фактура',
    'Графитовый кирпич + светлый шов',
    'Пока на карточке сервисная визуализация. После загрузки реального фото здесь будет готовый объект.',
    '/media/fallback/gallery-contrast-facade.svg',
    TRUE
  );

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
) VALUES
  (
    'granit-light-sand',
    'Термопанель Granit Light Sand',
    'Зернистая',
    'Песочный кирпич',
    'Светло-серый шов',
    '50 мм',
    0.56,
    3350,
    3790,
    'В наличии',
    'Спокойный светлый вариант для частных домов с мягкой зернистой фактурой.',
    'Подходит для фасадов, где нужен тёплый и аккуратный внешний вид без резкого контраста. Зернистая поверхность помогает сделать рисунок фасада более мягким, а светлый шов подчёркивает кладку без визуальной перегрузки.',
    FALSE
  ),
  (
    'smooth-milk-graphite',
    'Термопанель Smooth Milk Graphite',
    'Гладкая',
    'Молочный кирпич',
    'Графитовый шов',
    '40 мм',
    0.52,
    3490,
    3980,
    'В наличии',
    'Гладкая панель с контрастным швом для более современного и чистого фасада.',
    'Подходит для домов, где хочется получить аккуратный рисунок кирпича и более современный характер фасада. Контрастный шов делает раскладку выразительнее, а светлый кирпич сохраняет ощущение лёгкости.',
    FALSE
  ),
  (
    'clinker-graphite-ice',
    'Термопанель Clinker Graphite Ice',
    'Клинкерная',
    'Графитовый кирпич',
    'Светлый шов',
    '60 мм',
    0.58,
    3890,
    NULL,
    'Под заказ',
    'Выразительная клинкерная фактура для контрастных фасадов и заметного рисунка.',
    'Клинкерная фактура даёт более активный рельеф и подчёркнутый рисунок кладки. Такой вариант выбирают, когда фасаду нужен выраженный контраст и собранный визуальный ритм.',
    FALSE
  ),
  (
    'smooth-warm-stone',
    'Термопанель Smooth Warm Stone',
    'Гладкая',
    'Тёплый камень',
    'Песочный шов',
    '50 мм',
    0.54,
    3420,
    3650,
    'В наличии',
    'Тёплая гамма для фасадов, где хочется сохранить мягкий натуральный оттенок.',
    'Хорошо смотрится на частных домах с классическими и комбинированными фасадами. Тёплый оттенок панели помогает сделать внешний вид дома спокойным и собранным, а гладкая фактура оставляет рисунок аккуратным.',
    FALSE
  );

INSERT INTO product_images (
  product_id,
  image_path,
  alt_text,
  image_type,
  sort_order,
  caption
) VALUES
  ((SELECT id FROM products WHERE slug = 'granit-light-sand'), '/media/fallback/product-panel-far.svg', 'Термопанель Granit Light Sand: общий вид панели', 'Панель издалека', 1, 'Зернистая, основной вид панели'),
  ((SELECT id FROM products WHERE slug = 'granit-light-sand'), '/media/fallback/product-panel-closeup.svg', 'Термопанель Granit Light Sand: крупный план фактуры', 'Крупный план', 2, 'Фактура зернистая и рисунок шва'),
  ((SELECT id FROM products WHERE slug = 'granit-light-sand'), '/media/fallback/product-panel-side.svg', 'Термопанель Granit Light Sand: вид сбоку', 'Вид сбоку', 3, 'Толщина панели и визуальный рельеф сбоку'),
  ((SELECT id FROM products WHERE slug = 'granit-light-sand'), '/media/fallback/product-house-example.svg', 'Термопанель Granit Light Sand: пример фасада дома', 'Фасад дома', 4, 'Пример фасада с этой фактурой и сочетанием цвета'),

  ((SELECT id FROM products WHERE slug = 'smooth-milk-graphite'), '/media/fallback/product-panel-far.svg', 'Термопанель Smooth Milk Graphite: общий вид панели', 'Панель издалека', 1, 'Гладкая, основной вид панели'),
  ((SELECT id FROM products WHERE slug = 'smooth-milk-graphite'), '/media/fallback/product-panel-closeup.svg', 'Термопанель Smooth Milk Graphite: крупный план фактуры', 'Крупный план', 2, 'Фактура гладкая и рисунок шва'),
  ((SELECT id FROM products WHERE slug = 'smooth-milk-graphite'), '/media/fallback/product-panel-side.svg', 'Термопанель Smooth Milk Graphite: вид сбоку', 'Вид сбоку', 3, 'Толщина панели и визуальный рельеф сбоку'),
  ((SELECT id FROM products WHERE slug = 'smooth-milk-graphite'), '/media/fallback/product-house-example.svg', 'Термопанель Smooth Milk Graphite: пример фасада дома', 'Фасад дома', 4, 'Пример фасада с этой фактурой и сочетанием цвета'),

  ((SELECT id FROM products WHERE slug = 'clinker-graphite-ice'), '/media/fallback/product-panel-far.svg', 'Термопанель Clinker Graphite Ice: общий вид панели', 'Панель издалека', 1, 'Клинкерная, основной вид панели'),
  ((SELECT id FROM products WHERE slug = 'clinker-graphite-ice'), '/media/fallback/product-panel-closeup.svg', 'Термопанель Clinker Graphite Ice: крупный план фактуры', 'Крупный план', 2, 'Фактура клинкерная и рисунок шва'),
  ((SELECT id FROM products WHERE slug = 'clinker-graphite-ice'), '/media/fallback/product-panel-side.svg', 'Термопанель Clinker Graphite Ice: вид сбоку', 'Вид сбоку', 3, 'Толщина панели и визуальный рельеф сбоку'),
  ((SELECT id FROM products WHERE slug = 'clinker-graphite-ice'), '/media/fallback/product-house-example.svg', 'Термопанель Clinker Graphite Ice: пример фасада дома', 'Фасад дома', 4, 'Пример фасада с этой фактурой и сочетанием цвета'),

  ((SELECT id FROM products WHERE slug = 'smooth-warm-stone'), '/media/fallback/product-panel-far.svg', 'Термопанель Smooth Warm Stone: общий вид панели', 'Панель издалека', 1, 'Гладкая, основной вид панели'),
  ((SELECT id FROM products WHERE slug = 'smooth-warm-stone'), '/media/fallback/product-panel-closeup.svg', 'Термопанель Smooth Warm Stone: крупный план фактуры', 'Крупный план', 2, 'Фактура гладкая и рисунок шва'),
  ((SELECT id FROM products WHERE slug = 'smooth-warm-stone'), '/media/fallback/product-panel-side.svg', 'Термопанель Smooth Warm Stone: вид сбоку', 'Вид сбоку', 3, 'Толщина панели и визуальный рельеф сбоку'),
  ((SELECT id FROM products WHERE slug = 'smooth-warm-stone'), '/media/fallback/product-house-example.svg', 'Термопанель Smooth Warm Stone: пример фасада дома', 'Фасад дома', 4, 'Пример фасада с этой фактурой и сочетанием цвета');
