import { useEffect, useRef, useState } from 'react';
import Board from './Board';
import useFlexTool from './useFlexTool';
import { INITIAL_SETTINGS, LEVELS, PROPERTIES, layoutsMatch, toCss, validateSettings } from './levels';

const STORAGE_KEY = 'flex-practice-completed-v1';

function readCompleted() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (Array.isArray(value)) return [...new Set(value.filter((id) => LEVELS.some((level) => level.id === id)))];
  } catch { /* Прогресс необязателен: задания работают и без хранилища. */ }
  return [];
}

export default function App() {
  const [index, setIndex] = useState(0);
  const [settings, setSettings] = useState({ ...INITIAL_SETTINGS });
  const [completed, setCompleted] = useState(readCompleted);
  const [result, setResult] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');
  const [storageError, setStorageError] = useState(false);
  const reference = useRef(null);
  const playground = useRef(null);
  const level = LEVELS[index];
  const css = toCss(settings);

  function applySettings(next) {
    setSettings(validateSettings(next));
    setResult(null);
    setCopyMessage('');
  }
  useFlexTool(applySettings);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
      setStorageError(false);
    } catch { setStorageError(true); }
  }, [completed]);

  function changeLevel(nextIndex) {
    setIndex(nextIndex);
    setSettings({ ...INITIAL_SETTINGS });
    setResult(null);
    setShowHint(false);
    setCopyMessage('');
  }

  function changeProperty(key, value) {
    applySettings({ ...settings, [key]: key === 'gap' ? Number(value) : value });
  }

  function check() {
    const correct = layoutsMatch(reference.current, playground.current);
    setResult(correct ? 'success' : 'retry');
    if (correct) setCompleted((current) => current.includes(level.id) ? current : [...current, level.id]);
  }

  async function copyCss() {
    try {
      await navigator.clipboard.writeText(css);
      setCopyMessage('CSS скопирован.');
    } catch { setCopyMessage('Не удалось скопировать. Можно выделить код вручную.'); }
  }

  return <div className="app">
    <header><a className="brand" href="#main"><img src="/favicon.svg" width="32" height="32" alt="" />Flex-практика</a><span className="header-note">Небольшой тренажёр CSS</span></header>
    <main id="main">
      <div className="page-heading"><div><h1>Разберись с Flexbox на практике</h1><p>Смотри на образец и повторяй расположение трёх блоков.</p></div><span className="progress-label">Пройдено: {completed.length} / {LEVELS.length}</span></div>
      <nav className="level-nav" aria-label="Выбор задания">{LEVELS.map((item, itemIndex) => <button type="button" key={item.id}
        aria-current={index === itemIndex ? 'step' : undefined} aria-label={`Задание ${itemIndex + 1}: ${item.title}${completed.includes(item.id) ? ', пройдено' : ''}`}
        className={`${index === itemIndex ? 'active' : ''} ${completed.includes(item.id) ? 'done' : ''}`} onClick={() => changeLevel(itemIndex)}>
        <span>{completed.includes(item.id) ? '✓' : String(itemIndex + 1).padStart(2, '0')}</span>{item.title}
      </button>)}</nav>
      <div className="task"><span className="task-number">ЗАДАНИЕ {index + 1}</span><h2>{level.title}</h2><p>{level.description}</p></div>
      <div className="boards"><Board settings={level.answer} boardRef={reference} label="Образец" target /><Board settings={settings} boardRef={playground} label="Твой результат" /></div>
      <div className="editor">
        <section className="controls" aria-labelledby="settings-title"><h2 id="settings-title">Настройки контейнера</h2>
          <div className="property-grid">{PROPERTIES.map((property) => <div className="property" key={property.key}>
            <label htmlFor={property.key}><code>{property.css}</code><span>{property.label}</span></label>
            <select id={property.key} value={settings[property.key]} onChange={(event) => changeProperty(property.key, event.target.value)}>
              {property.options.map((value) => <option key={value} value={value}>{value}{property.key === 'gap' ? ' px' : ''}</option>)}
            </select><small>{property.note}</small>
          </div>)}</div>
        </section>
        <section className="code-panel" aria-labelledby="code-title"><div className="code-heading"><h2 id="code-title">Получается такой CSS</h2><button type="button" onClick={copyCss}>Скопировать</button></div><pre><code>{css}</code></pre><p role="status">{copyMessage || 'Эти свойства применены к твоему контейнеру.'}</p></section>
      </div>
      <div className="actions"><button className="primary" type="button" onClick={check}>Проверить результат</button><button type="button" className="secondary" onClick={() => setShowHint((value) => !value)} aria-expanded={showHint}>{showHint ? 'Скрыть подсказку' : 'Нужна подсказка'}</button>
        {completed.includes(level.id) && index < LEVELS.length - 1 && <button className="next" type="button" onClick={() => changeLevel(index + 1)}>Следующее задание</button>}
      </div>
      <div className={`feedback ${result || ''}`} role="status">{result === 'success' ? 'Получилось! Блоки расположены как в образце.' : result === 'retry' ? 'Пока не совпадает. Сравни положение блоков и расстояние между ними.' : 'Измени свойства, затем нажми «Проверить результат».'}</div>
      {showHint && <aside className="hint"><strong>Подсказка</strong><p>{level.hint}</p></aside>}
      {completed.length === LEVELS.length && <p className="all-done">Все шесть заданий пройдены. Можно вернуться к любому и попробовать другой способ решения.</p>}
      {storageError && <p className="storage-error" role="alert">Браузер не разрешил сохранить прогресс. Задания доступны, но отметки не сохранятся после перезагрузки.</p>}
    </main>
    <footer><span>Flex-практика · учебный проект</span><span>В этом браузере сохраняются отметки пройденных заданий.</span></footer>
  </div>;
}
