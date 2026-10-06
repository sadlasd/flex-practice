export default function Board({ settings, boardRef, label, target = false }) {
  return <section className="board-panel" aria-label={label}>
    <div className="board-heading"><h2>{label}</h2><span>{target ? 'Повтори этот макет' : 'Меняй свойства ниже'}</span></div>
    <div className="board" ref={boardRef} style={{ ...settings, gap: `${settings.gap}px` }}>
      <span className="block block-one">1</span>
      <span className="block block-two">2</span>
      <span className="block block-three">3</span>
    </div>
    <p className="board-caption">Порядок блоков: 1 → 2 → 3</p>
  </section>;
}
