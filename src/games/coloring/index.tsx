import { useEffect, useRef, useState } from 'react'
import { Artwork } from './Artwork'
import { Coloring } from './Coloring'
import { drawings, officialCatalog, type Drawing } from './data/drawings'
import { progress, readProgress } from './engine'
import './coloring.css'

export default function ColoringGame() {
  const [opened, setOpened] = useState<Drawing | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const hasOpened = useRef(false)
  useEffect(() => {
    if (opened) hasOpened.current = true
    if (hasOpened.current) heading.current?.focus()
  }, [opened])
  return <div className="coloring-game">
    {!opened ? <section className="drawing-gallery" aria-labelledby="coloring-title">
      <header className="gallery-heading"><img src={import.meta.env.BASE_URL + 'icons/studio-192.png'} alt="" width={64} height={64}/><div><h1 id="coloring-title" tabIndex={-1} ref={heading}>알록달록 색칠놀이터</h1><p>좋아하는 그림을 골라요. 같은 숫자를 찾아 하나씩 톡!</p></div></header>
      <div className="drawing-grid">{officialCatalog.map(item => {
        const drawing = drawings[item.id]
        const saved = readProgress(drawing).saved
        const percent = progress(drawing, saved?.history ?? [])
        const count = saved?.history.length ?? 0
        return <button key={item.id} className={`drawing-card drawing-${item.tint}`} onClick={() => setOpened(drawing)} aria-label={`${item.title}, ${drawing.colors.length}색, ${count ? '이어서 색칠하기' : '색칠하기'}`}>
          <span className="drawing-preview"><Artwork drawing={drawing} history={[]} preview /></span>
          <strong>{item.title}</strong><span className="drawing-meta">{drawing.colors.length}가지 색 · {count === drawing.regions.length ? '완성했어요 ★' : count ? percent ? `${percent}% 칠했어요` : `${count}곳 칠했어요` : '차근차근 칠해요'}</span>
          <span className="drawing-start">{count === drawing.regions.length ? '완성한 그림 보기' : count ? '이어서 색칠하기' : '색칠 시작'} <span aria-hidden="true">→</span></span>
        </button>
      })}</div>
      <p className="gallery-note">✦ 색은 순서대로 바뀌어요. 칠한 그림은 이 기기에 자동으로 저장돼요.</p>
    </section> : <><h2 ref={heading} tabIndex={-1} className="sr-only">순서대로 색칠놀이 작업실</h2><Coloring key={opened.id} drawing={opened} onBack={() => setOpened(null)}/></>}
  </div>
}
