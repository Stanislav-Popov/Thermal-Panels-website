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
  max_url,
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
  'Пятигорск, Бештаугорское шоссе 56',
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
    'Термопанели для фасада',
    'Покажем фактуры, подберём сочетание цвета кирпича и шва и быстро дадим предварительный расчёт под ваш фасад.',
    'Рассчитать стоимость',
    '#calculator',
    '{}'::jsonb
  ),
  (
    'partners',
    'Сотрудничество для магазинов, бригад и застройщиков',
    '',
    'Работаем с партнёрами, которым важно стабильное качество, понятные условия и предсказуемый результат на объектах.',
    'Обсудить условия',
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
  sort_order,
  is_published
) VALUES
  (
    'Фасад в светлой гамме',
    'Гладкая фактура',
    'Светлый кирпич + светлый шов',
    'Реальный пример светлого фасада с мягкой кладкой и спокойной гаммой.',
    '/media/gallery/Panel-and-facade-options-1.webp',
    0,
    TRUE
  ),
  (
    'Контрастный современный фасад',
    'Клинкерная фактура',
    'Графитовый кирпич + светлый шов',
    'Реальный пример контрастного фасада с выразительным рисунком кладки.',
    '/media/gallery/Panel-and-facade-options-2.webp',
    1,
    TRUE
  ),
  (
    'Сбалансированное сочетание панели и шва',
    'Зернистая фактура',
    'Песочный кирпич + светлый шов',
    'Пример фасада со спокойным сочетанием панели и шва для мягкого визуального ритма.',
    '/media/gallery/Panel-and-facade-options-3.webp',
    2,
    TRUE
  ),
  (
    'Светлое фасадное решение',
    'Гладкая фактура',
    'Светлая панель + нейтральный шов',
    'Светлое фасадное решение с аккуратной кладкой и ровным спокойным тоном.',
    '/media/gallery/Panel-and-facade-options-4.webp',
    3,
    TRUE
  ),
  (
    'Контрастное фасадное сочетание',
    'Клинкерная фактура',
    'Тёплый кирпич + тёмный акцентный шов',
    'Контрастный пример фасада, где выразительно работает рисунок кладки и цветовой акцент.',
    '/media/gallery/Panel-and-facade-options-5.webp',
    4,
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
  ((SELECT id FROM products WHERE slug = 'granit-light-sand'), '/media/products/product-1/product-1-1.webp', 'Термопанель Granit Light Sand: общий вид панели', 'Панель издалека', 1, 'Зернистая, основной вид панели'),
  ((SELECT id FROM products WHERE slug = 'granit-light-sand'), '/media/products/product-1/product-1-2.webp', 'Термопанель Granit Light Sand: крупный план фактуры', 'Крупный план', 2, 'Фактура зернистая и рисунок шва'),
  ((SELECT id FROM products WHERE slug = 'granit-light-sand'), '/media/products/product-1/product-1-3.webp', 'Термопанель Granit Light Sand: вид сбоку', 'Вид сбоку', 3, 'Толщина панели и визуальный рельеф сбоку'),
  ((SELECT id FROM products WHERE slug = 'granit-light-sand'), '/media/products/product-1/product-1-4.webp', 'Термопанель Granit Light Sand: пример фасада дома', 'Фасад дома', 4, 'Пример фасада с этой фактурой и сочетанием цвета'),

  ((SELECT id FROM products WHERE slug = 'smooth-milk-graphite'), '/media/products/product-2/product-2-1.webp', 'Термопанель Smooth Milk Graphite: общий вид панели', 'Панель издалека', 1, 'Гладкая, основной вид панели'),
  ((SELECT id FROM products WHERE slug = 'smooth-milk-graphite'), '/media/products/product-2/product-2-2.webp', 'Термопанель Smooth Milk Graphite: крупный план фактуры', 'Крупный план', 2, 'Фактура гладкая и рисунок шва'),
  ((SELECT id FROM products WHERE slug = 'smooth-milk-graphite'), '/media/products/product-2/product-2-3.webp', 'Термопанель Smooth Milk Graphite: вид сбоку', 'Вид сбоку', 3, 'Толщина панели и визуальный рельеф сбоку'),
  ((SELECT id FROM products WHERE slug = 'smooth-milk-graphite'), '/media/products/product-2/product-2-4.webp', 'Термопанель Smooth Milk Graphite: пример фасада дома', 'Фасад дома', 4, 'Пример фасада с этой фактурой и сочетанием цвета'),

  ((SELECT id FROM products WHERE slug = 'clinker-graphite-ice'), '/media/products/product-3/product-3-1.webp', 'Термопанель Clinker Graphite Ice: общий вид панели', 'Панель издалека', 1, 'Клинкерная, основной вид панели'),
  ((SELECT id FROM products WHERE slug = 'clinker-graphite-ice'), '/media/products/product-3/product-3-2.webp', 'Термопанель Clinker Graphite Ice: крупный план фактуры', 'Крупный план', 2, 'Фактура клинкерная и рисунок шва'),
  ((SELECT id FROM products WHERE slug = 'clinker-graphite-ice'), '/media/products/product-3/product-3-3.webp', 'Термопанель Clinker Graphite Ice: вид сбоку', 'Вид сбоку', 3, 'Толщина панели и визуальный рельеф сбоку'),
  ((SELECT id FROM products WHERE slug = 'clinker-graphite-ice'), '/media/products/product-3/product-3-4.webp', 'Термопанель Clinker Graphite Ice: пример фасада дома', 'Фасад дома', 4, 'Пример фасада с этой фактурой и сочетанием цвета'),

  ((SELECT id FROM products WHERE slug = 'smooth-warm-stone'), '/media/products/product-4/product-4-1.webp', 'Термопанель Smooth Warm Stone: общий вид панели', 'Панель издалека', 1, 'Гладкая, основной вид панели'),
  ((SELECT id FROM products WHERE slug = 'smooth-warm-stone'), '/media/products/product-4/product-4-2.webp', 'Термопанель Smooth Warm Stone: крупный план фактуры', 'Крупный план', 2, 'Фактура гладкая и рисунок шва'),
  ((SELECT id FROM products WHERE slug = 'smooth-warm-stone'), '/media/products/product-4/product-4-3.webp', 'Термопанель Smooth Warm Stone: вид сбоку', 'Вид сбоку', 3, 'Толщина панели и визуальный рельеф сбоку'),
  ((SELECT id FROM products WHERE slug = 'smooth-warm-stone'), '/media/products/product-4/product-4-4.webp', 'Термопанель Smooth Warm Stone: пример фасада дома', 'Фасад дома', 4, 'Пример фасада с этой фактурой и сочетанием цвета');
