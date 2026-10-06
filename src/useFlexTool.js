import { useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { PROPERTIES, toCss, validateSettings } from './levels';

// Дополнительный способ менять те же настройки в браузерах с WebMCP.
export default function useFlexTool(applySettings) {
  const action = useRef(applySettings);
  useEffect(() => { action.current = applySettings; }, [applySettings]);
  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      Promise.resolve(context.registerTool({
        name: 'set_flex_properties',
        title: 'Изменить настройки Flexbox',
        description: 'Применяет четыре CSS-свойства к видимому контейнеру «Твой результат». Не проверяет ответ и не отмечает задание пройденным.',
        inputSchema: {
          type: 'object',
          properties: Object.fromEntries(PROPERTIES.map((property) => [property.key,
            { type: property.key === 'gap' ? 'integer' : 'string', enum: property.options }])),
          required: PROPERTIES.map((property) => property.key),
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input) {
          const next = validateSettings(input);
          flushSync(() => action.current(next));
          return { applied: next, css: toCss(next) };
        },
      }, { signal: lifecycle.signal })).catch(() => {});
    } catch { /* Если интеграция недоступна, обычные селекты продолжают работать. */ }
    return () => lifecycle.abort();
  }, []);
}
