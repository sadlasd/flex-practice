export const INITIAL_SETTINGS = { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8 };

export const PROPERTIES = [
  { key: 'flexDirection', css: 'flex-direction', label: 'Направление', options: ['row', 'column'], note: 'row — строка, column — столбик.' },
  { key: 'justifyContent', css: 'justify-content', label: 'Главная ось', options: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around'], note: 'Расположение вдоль строки или столбика.' },
  { key: 'alignItems', css: 'align-items', label: 'Поперечная ось', options: ['flex-start', 'center', 'flex-end'], note: 'Выравнивание поперёк главной оси.' },
  { key: 'gap', css: 'gap', label: 'Промежуток', options: [8, 16, 24], note: 'Расстояние между соседними блоками.' },
];

export const LEVELS = [
  { id: 'line', title: 'Собери строку', description: 'Оставь блоки слева, выровняй их по высоте и увеличь промежуток до 16 px.',
    hint: 'Направление уже верное. Попробуй align-items: center и gap: 16px.',
    answer: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', gap: 16 } },
  { id: 'center', title: 'В самый центр', description: 'Расположи всю строку в центре контейнера. Промежуток — 16 px.',
    hint: 'В строке justify-content отвечает за горизонталь, а align-items — за вертикаль. Здесь обоим нужно center.',
    answer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16 } },
  { id: 'edges', title: 'Займи всю ширину', description: 'Прижми первый и последний блоки к краям. Средний должен оказаться между ними.',
    hint: 'Нужен space-between по главной оси. Он распределяет свободное место между блоками. По высоте — center.',
    answer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 } },
  { id: 'column', title: 'Теперь столбик', description: 'Собери вертикальную группу по центру. Между блоками оставь 16 px.',
    hint: 'Сначала выбери column. Теперь главная ось вертикальная, а поперечная — горизонтальная. Оба выравнивания — center.',
    answer: { flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 16 } },
  { id: 'corner', title: 'В правый верхний угол', description: 'Поставь блоки в столбик справа сверху. Промежуток — 8 px.',
    hint: 'Для column верх — это justify-content: flex-start, а правая сторона — align-items: flex-end.',
    answer: { flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-end', gap: 8 } },
  { id: 'bottom', title: 'Последняя строка', description: 'Верни строку, прижми её вправо и вниз. Между блоками оставь 24 px.',
    hint: 'Выбери row, затем flex-end по обеим осям. Не забудь про gap: 24px.',
    answer: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'flex-end', gap: 24 } },
];

export function toCss(settings) {
  return `.container {\n  display: flex;\n${PROPERTIES.map((property) => `  ${property.css}: ${settings[property.key]}${property.key === 'gap' ? 'px' : ''};`).join('\n')}\n}`;
}

export function validateSettings(settings) {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings) ||
    Object.keys(settings).length !== PROPERTIES.length ||
    !PROPERTIES.every((property) => property.options.includes(settings[property.key]))) {
    throw new Error('Выбери допустимые значения всех четырёх свойств.');
  }
  return { ...settings };
}

// Сравниваем положение блоков, а не набор свойств: у одного макета бывают разные решения.
export function layoutsMatch(reference, playground) {
  if (!reference || !playground) return false;
  const targetBounds = reference.getBoundingClientRect();
  const ownBounds = playground.getBoundingClientRect();
  return [...reference.children].every((block, index) => {
    const target = block.getBoundingClientRect();
    const own = playground.children[index]?.getBoundingClientRect();
    return own && Math.abs((target.left - targetBounds.left) - (own.left - ownBounds.left)) < 2 &&
      Math.abs((target.top - targetBounds.top) - (own.top - ownBounds.top)) < 2;
  });
}
