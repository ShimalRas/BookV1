import { useMemo, useState, type CSSProperties } from 'react'

type RankName = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS-1' | 'SS-2' | 'SS-3' | 'Mythic-1' | 'Mythic-2' | 'Demi' | 'Divine'
type SystemMode = 'status' | 'skills'

type Palette = {
  base: string
  panel: string
  accent: string
  accentSoft: string
  glow: string
  text: string
}

const rankColors: Record<RankName, Palette> = {
  E: { base: '#1d2230', panel: '#273041', accent: '#7c8aa1', accentSoft: '#3a4558', glow: '#c7d2fe', text: '#f5f7fb' },
  D: { base: '#16273a', panel: '#20384f', accent: '#4f8cc9', accentSoft: '#2d5378', glow: '#dbeafe', text: '#f4f8fb' },
  C: { base: '#17312f', panel: '#214542', accent: '#50a7a1', accentSoft: '#2d5d5a', glow: '#d1fae5', text: '#f2fbfa' },
  B: { base: '#2b2a14', panel: '#3d3820', accent: '#d4a02f', accentSoft: '#6f5a1d', glow: '#fde68a', text: '#fffaf0' },
  A: { base: '#352047', panel: '#4a2f67', accent: '#b06cff', accentSoft: '#6b3f94', glow: '#e9d5ff', text: '#fcf7ff' },
  S: { base: '#3d1e13', panel: '#5a2f1f', accent: '#ff8a3d', accentSoft: '#8a4628', glow: '#fed7aa', text: '#fff9f4' },
  'SS-1': { base: '#1f2c4d', panel: '#2d416d', accent: '#5db3ff', accentSoft: '#355f94', glow: '#bfdbfe', text: '#f5faff' },
  'SS-2': { base: '#1d2240', panel: '#2b3360', accent: '#7a84ff', accentSoft: '#3e4f8a', glow: '#c7d2fe', text: '#f7f7ff' },
  'SS-3': { base: '#3a1531', panel: '#5a224d', accent: '#ff6bc8', accentSoft: '#8b356f', glow: '#f9a8d4', text: '#fff7fb' },
  'Mythic-1': { base: '#311d36', panel: '#482553', accent: '#d96cff', accentSoft: '#7a3d8d', glow: '#f0abfc', text: '#fcf6ff' },
  'Mythic-2': { base: '#12364c', panel: '#1b4f70', accent: '#53d0ff', accentSoft: '#27688f', glow: '#bae6fd', text: '#f1fbff' },
  Demi: { base: '#1c1a2c', panel: '#2d2947', accent: '#9c7bff', accentSoft: '#52428c', glow: '#ddd6fe', text: '#faf7ff' },
  Divine: { base: '#1a1033', panel: '#26164a', accent: '#f5c85a', accentSoft: '#4f2f77', glow: '#fff0b8', text: '#fffdf6' },
}

const alok = {
  name: 'Alok Aeonmorta',
  race: 'mixed',
  rank: 'Divine' as RankName,
  level: 135,
  str: 7449,
  agi: 9560,
  vit: 10020,
  intelligence: 15190,
  divinity: 8420,
  title: 'Eternal Legion Sovereign',
  fatigue: 33,
  hp: 310092,
  mp: 488430,
  skills: [
    'Regeneration (Divine)',
    'Thunder\'s Judgement',
    'Soul Absorber',
    'Sovereign of Eternal Legions',
    'Astraean Valkyrie Sword Style',
    'Lightning Manipulation',
    'Flame Manipulation',
    'Blood Manipulation',
  ],
}

function App() {
  const [mode, setMode] = useState<SystemMode>('status')
  const palette = rankColors[alok.rank]
  const totalPower = useMemo(
    () => alok.str + alok.agi + alok.vit + alok.intelligence + alok.divinity,
    [],
  )

  return (
    <div
      className="app"
      style={{
        '--base': palette.base,
        '--panel': palette.panel,
        '--accent': palette.accent,
        '--accent-soft': palette.accentSoft,
        '--glow': palette.glow,
        '--text': palette.text,
      } as CSSProperties}
    >
      <header className="topbar">
        <div>
          <h1>Story App</h1>
          <p>Local character manager with stats, skills, history, and progression</p>
        </div>
        <div className="rank-badge">Lv {alok.level} {alok.rank}</div>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <div className="char-pill">{alok.name} | {alok.race}</div>
          <button>New Character</button>
          <button>Save Character</button>
          <button>Refresh</button>
        </aside>

        <section className="main-panel">
          <article className="sheet-card">
            <h2>Character Sheet</h2>
            <div className="grid2">
              <label>Name<input defaultValue={alok.name} /></label>
              <label>Race<input defaultValue={alok.race} /></label>
              <label>Rank<input defaultValue={alok.rank} /></label>
              <label>Level<input defaultValue={alok.level} /></label>
              <label>STR<input defaultValue={alok.str} /></label>
              <label>AGI<input defaultValue={alok.agi} /></label>
              <label>VIT<input defaultValue={alok.vit} /></label>
              <label>INT<input defaultValue={alok.intelligence} /></label>
              <label>Divinity<input defaultValue={alok.divinity} /></label>
            </div>
            <label className="notes">Notes<textarea defaultValue="Seeded from source notes." /></label>
          </article>

          <article className="status-window">
            <div className="status-frame">
              <div className="status-head">
                <div className="stars">✦ ✧ ✦</div>
                <h3>STATUS</h3>
                <p>CELESTIAL DIVINE INTERFACE</p>
                <h4>{alok.name}</h4>
                <small>{alok.race} • {alok.rank} • Level {alok.level} • Total power {totalPower.toLocaleString()}</small>
              </div>

              <div className="mode-row">
                <button className={mode === 'status' ? 'active' : ''} onClick={() => setMode('status')}>Status</button>
                <button className={mode === 'skills' ? 'active' : ''} onClick={() => setMode('skills')}>Skills</button>
              </div>

              {mode === 'status' ? (
                <>
                  <div className="summary-grid">
                    <Card label="Name" value={alok.name} />
                    <Card label="Level" value={String(alok.level)} />
                    <Card label="Job" value={alok.rank} />
                    <Card label="Fatigue" value={String(alok.fatigue)} />
                    <Card label="Title" value={alok.title} />
                    <Card label="HP" value={alok.hp.toLocaleString()} />
                    <Card label="MP" value={alok.mp.toLocaleString()} />
                    <Card label="Remaining Points" value="0" />
                  </div>

                  <div className="stat-grid">
                    <Card label="STR" value={alok.str.toLocaleString()} />
                    <Card label="AGI" value={alok.agi.toLocaleString()} />
                    <Card label="VIT" value={alok.vit.toLocaleString()} />
                    <Card label="INTELLIGENCE" value={alok.intelligence.toLocaleString()} />
                    <Card label="DIVINITY" value={alok.divinity.toLocaleString()} />
                  </div>

                  <div className="canon">Canon profile active: Alok is the main focus</div>
                </>
              ) : (
                <div className="skills-list">
                  {alok.skills.map((skill) => (
                    <div key={skill} className="skill-row">{skill}</div>
                  ))}
                </div>
              )}
            </div>
          </article>
        </section>
      </main>
    </div>
  )
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export default App
