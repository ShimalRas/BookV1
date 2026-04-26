import { useEffect, useMemo, useState, type CSSProperties } from 'react'

type RankName = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS-1' | 'SS-2' | 'SS-3' | 'Mythic-1' | 'Mythic-2' | 'Demi' | 'Divine'
type SystemMode = 'status' | 'skills'
type WorkspacePage = 'panel' | 'editor' | 'history' | 'progression'

type Palette = {
  base: string
  panel: string
  accent: string
  accentSoft: string
  glow: string
  text: string
}

type Skill = {
  id: string
  name: string
  rank: string
  description: string
}

type HistoryEntry = {
  id: string
  timestamp: string
  action: string
  detail: string
}

type Character = {
  id: string
  name: string
  race: string
  rank: RankName
  level: number
  str: number
  agi: number
  vit: number
  intelligence: number
  divinity: number
  title: string
  fatigue: number
  remainingPoints: number
  notes: string
  skills: Skill[]
  history: HistoryEntry[]
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

const rankGains: Record<RankName, { phy: number; int: number; divinity: number }> = {
  E: { phy: 1, int: 2, divinity: 0 },
  D: { phy: 1, int: 2, divinity: 0 },
  C: { phy: 1, int: 2, divinity: 0 },
  B: { phy: 1, int: 2, divinity: 0 },
  A: { phy: 1, int: 2, divinity: 0 },
  S: { phy: 3, int: 5, divinity: 0 },
  'SS-1': { phy: 3, int: 5, divinity: 0 },
  'SS-2': { phy: 3, int: 5, divinity: 0 },
  'SS-3': { phy: 3, int: 5, divinity: 0 },
  'Mythic-1': { phy: 3, int: 5, divinity: 0 },
  'Mythic-2': { phy: 3, int: 5, divinity: 0 },
  Demi: { phy: 5, int: 10, divinity: 2 },
  Divine: { phy: 5, int: 10, divinity: 4 },
}

const races = ['human', 'elf', 'vampire', 'dragonoid', 'angel', 'fairy', 'valkyrie', 'demon', 'mixed']
const ranks: RankName[] = ['E', 'D', 'C', 'B', 'A', 'S', 'SS-1', 'SS-2', 'SS-3', 'Mythic-1', 'Mythic-2', 'Demi', 'Divine']
const STORAGE_KEY = 'story-app-react-v2'

const seededCharacter: Character = {
  id: crypto.randomUUID(),
  name: 'Alok Aeonmorta',
  race: 'mixed',
  rank: 'Divine',
  level: 135,
  str: 7449,
  agi: 9560,
  vit: 10020,
  intelligence: 15190,
  divinity: 8420,
  title: 'Eternal Legion Sovereign',
  fatigue: 33,
  remainingPoints: 0,
  notes: 'Seeded from source notes. Main canon profile.',
  skills: [
    { id: crypto.randomUUID(), name: 'Regeneration (Divine)', rank: 'Divine', description: 'Regenerates body from damage and poisons.' },
    { id: crypto.randomUUID(), name: 'Thunder\'s Judgement', rank: 'Divine', description: 'Divine lightning spear and storm field.' },
    { id: crypto.randomUUID(), name: 'Sovereign of Eternal Legions', rank: 'Divine', description: 'Rules undead and soul-bound familiars.' },
    { id: crypto.randomUUID(), name: 'Astraean Valkyrie Sword Style', rank: 'Rank S', description: 'Royal sword art with multi-form attacks.' },
    { id: crypto.randomUUID(), name: 'Lightning Manipulation', rank: 'Rank B', description: 'Lightning arsenal and chained strikes.' },
  ],
  history: [
    { id: crypto.randomUUID(), timestamp: new Date().toISOString(), action: 'Seed', detail: 'Created Alok canon profile with Divine rank.' },
  ],
}

function loadInitialCharacters(): Character[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [seededCharacter]
    const parsed = JSON.parse(raw) as Character[]
    if (!Array.isArray(parsed) || parsed.length === 0) return [seededCharacter]
    return parsed
  } catch {
    return [seededCharacter]
  }
}

function App() {
  const [characters, setCharacters] = useState<Character[]>(() => loadInitialCharacters())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mode, setMode] = useState<SystemMode>('status')
  const [page, setPage] = useState<WorkspacePage>('panel')
  const [skillDraft, setSkillDraft] = useState({ name: '', rank: 'Rank C', description: '' })

  const selected = useMemo(() => characters.find((item) => item.id === selectedId), [characters, selectedId])

  const palette = rankColors[selected?.rank ?? 'Divine']
  const isAlok = selected?.name.toLowerCase() === 'alok aeonmorta'
  const totalPower = selected ? selected.str + selected.agi + selected.vit + selected.intelligence + selected.divinity : 0
  const hp = selected ? selected.vit * 25 + selected.str * 8 : 0
  const mp = selected ? selected.intelligence * 25 + selected.divinity * 4 : 0
  const hpFill = selected ? Math.min(100, Math.round((hp / (selected.level * 3000)) * 100)) : 0
  const mpFill = selected ? Math.min(100, Math.round((mp / (selected.level * 4600)) * 100)) : 0

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters))
  }, [characters])

  function updateSelected(patch: Partial<Character>, action = 'Edit', detail = 'Updated character data') {
    if (!selected) return
    setCharacters((prev) =>
      prev.map((item) => {
        if (item.id !== selected.id) return item
        return {
          ...item,
          ...patch,
          history: [{ id: crypto.randomUUID(), timestamp: new Date().toISOString(), action, detail }, ...item.history],
        }
      }),
    )
  }

  function addCharacter() {
    const created: Character = {
      id: crypto.randomUUID(),
      name: `New Character ${characters.length + 1}`,
      race: 'human',
      rank: 'E',
      level: 1,
      str: 50,
      agi: 50,
      vit: 50,
      intelligence: 60,
      divinity: 0,
      title: 'Unassigned',
      fatigue: 0,
      remainingPoints: 0,
      notes: '',
      skills: [],
      history: [{ id: crypto.randomUUID(), timestamp: new Date().toISOString(), action: 'Create', detail: 'Character created.' }],
    }
    setCharacters((prev) => [created, ...prev])
    setSelectedId(created.id)
  }

  function levelUpSelected() {
    if (!selected) return
    const gain = rankGains[selected.rank]
    updateSelected(
      {
        level: selected.level + 1,
        str: selected.str + gain.phy,
        agi: selected.agi + gain.phy,
        vit: selected.vit + gain.phy,
        intelligence: selected.intelligence + gain.int,
        divinity: selected.divinity + gain.divinity,
        remainingPoints: selected.remainingPoints + gain.phy + gain.int + gain.divinity,
      },
      'Level Up',
      `Leveled to ${selected.level + 1} with ${selected.rank} gains (+${gain.phy} PHY, +${gain.int} INT).`,
    )
  }

  function addSkill() {
    if (!selected) return
    if (!skillDraft.name.trim()) return
    const skill: Skill = {
      id: crypto.randomUUID(),
      name: skillDraft.name.trim(),
      rank: skillDraft.rank,
      description: skillDraft.description.trim(),
    }
    updateSelected(
      { skills: [skill, ...selected.skills] },
      'Skill',
      `Added skill ${skill.name} (${skill.rank}).`,
    )
    setSkillDraft({ name: '', rank: 'Rank C', description: '' })
  }

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
          <p>Local character manager with a dedicated celestial panel, separate stat editor, and saved history</p>
        </div>
        <div className="rank-badge">{selected ? `Lv ${selected.level} ${selected.rank}` : 'No character selected'}</div>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <div className="char-list">
            {characters.map((character) => (
              <button
                key={character.id}
                className={character.id === selectedId ? 'char-pill active' : 'char-pill'}
                onClick={() => setSelectedId(character.id)}
              >
                {character.name} | {character.race}
              </button>
            ))}
          </div>
          <button onClick={addCharacter}>New Character</button>
          <button onClick={() => updateSelected({}, 'Save', 'Manual save event recorded.')} disabled={!selected}>Save Character</button>
          <button onClick={levelUpSelected}>Level Up</button>
        </aside>

        <section className="main-panel">
          <div className="workspace-tabs">
            <button className={page === 'panel' ? 'active' : ''} onClick={() => setPage('panel')}>System Panel</button>
            <button className={page === 'editor' ? 'active' : ''} onClick={() => setPage('editor')}>Stat Editor</button>
            <button className={page === 'history' ? 'active' : ''} onClick={() => setPage('history')}>History</button>
            <button className={page === 'progression' ? 'active' : ''} onClick={() => setPage('progression')}>Progression</button>
          </div>

          {!selected && (
            <article className="empty-state">
              <h2>Select A Character</h2>
              <p>Choose a character from the left list to open the system panel.</p>
            </article>
          )}

          {selected && page === 'editor' && (
            <article className="sheet-card">
              <h2>Stat Editor</h2>
              <div className="grid2">
                <label>Name<input value={selected.name} onChange={(event) => updateSelected({ name: event.target.value }, 'Edit', 'Updated name.')} /></label>
                <label>Race<select value={selected.race} onChange={(event) => updateSelected({ race: event.target.value }, 'Edit', 'Updated race.')}>{races.map((race) => <option key={race}>{race}</option>)}</select></label>
                <label>Rank<select value={selected.rank} onChange={(event) => updateSelected({ rank: event.target.value as RankName }, 'Edit', 'Updated rank.')}>{ranks.map((rank) => <option key={rank}>{rank}</option>)}</select></label>
                <label>Level<input type="number" value={selected.level} onChange={(event) => updateSelected({ level: Number(event.target.value) || 1 }, 'Edit', 'Adjusted level manually.')} /></label>
                <label>STR<input type="number" value={selected.str} onChange={(event) => updateSelected({ str: Number(event.target.value) || 0 }, 'Edit', 'Adjusted STR.')} /></label>
                <label>AGI<input type="number" value={selected.agi} onChange={(event) => updateSelected({ agi: Number(event.target.value) || 0 }, 'Edit', 'Adjusted AGI.')} /></label>
                <label>VIT<input type="number" value={selected.vit} onChange={(event) => updateSelected({ vit: Number(event.target.value) || 0 }, 'Edit', 'Adjusted VIT.')} /></label>
                <label>INT<input type="number" value={selected.intelligence} onChange={(event) => updateSelected({ intelligence: Number(event.target.value) || 0 }, 'Edit', 'Adjusted INT.')} /></label>
                <label>Divinity<input type="number" value={selected.divinity} onChange={(event) => updateSelected({ divinity: Number(event.target.value) || 0 }, 'Edit', 'Adjusted Divinity.')} /></label>
              </div>
              <label className="notes">Notes<textarea value={selected.notes} onChange={(event) => updateSelected({ notes: event.target.value }, 'Notes', 'Updated notes.')} /></label>
            </article>
          )}

          {selected && page === 'history' && (
            <article className="sheet-card">
              <h2>History Timeline</h2>
              <div className="history-list">
                {selected.history.map((entry) => (
                  <div key={entry.id} className="history-row">
                    <strong>{entry.action}</strong>
                    <span>{entry.detail}</span>
                    <small>{new Date(entry.timestamp).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            </article>
          )}

          {selected && page === 'progression' && (
            <article className="sheet-card">
              <h2>Progression</h2>
              <div className="progress-panel">
                <p>Current rank: <strong>{selected.rank}</strong></p>
                <p>Level gain model: +{rankGains[selected.rank].phy} PHY, +{rankGains[selected.rank].int} INT, +{rankGains[selected.rank].divinity} Divinity</p>
                <p>Remaining points: <strong>{selected.remainingPoints}</strong></p>
                <button onClick={levelUpSelected}>Apply One Level Up</button>
              </div>
            </article>
          )}

          {selected && page === 'panel' && (
            <article className="status-window panel-only">
              <div className={isAlok ? 'status-frame alok-frame' : 'status-frame'}>
                <div className="status-head">
                  <div className="stars">✦ ✧ ✦</div>
                  <h3>STATUS</h3>
                  <p>{isAlok ? 'CELESTIAL DIVINE INTERFACE' : 'SYSTEM INTERFACE'}</p>
                  <h4>{selected.name}</h4>
                  <small>{selected.race} • {selected.rank} • Level {selected.level} • Total power {totalPower.toLocaleString()}</small>
                </div>

                <div className="mode-row">
                  <button className={mode === 'status' ? 'active' : ''} onClick={() => setMode('status')}>Status</button>
                  <button className={mode === 'skills' ? 'active' : ''} onClick={() => setMode('skills')}>Skills</button>
                </div>

                {mode === 'status' ? (
                  <>
                    <div className="bars">
                      <div>
                        <label>HP</label>
                        <div className="bar-track"><div className="bar-fill" style={{ width: `${hpFill}%` }} /></div>
                        <strong>{hp.toLocaleString()}</strong>
                      </div>
                      <div>
                        <label>MP</label>
                        <div className="bar-track"><div className="bar-fill mp" style={{ width: `${mpFill}%` }} /></div>
                        <strong>{mp.toLocaleString()}</strong>
                      </div>
                    </div>

                    <div className="summary-grid">
                      <Card label="Name" value={selected.name} />
                      <Card label="Level" value={String(selected.level)} />
                      <Card label="Job" value={selected.rank} />
                      <Card label="Fatigue" value={String(selected.fatigue)} />
                      <Card label="Title" value={selected.title} />
                      <Card label="Remaining Points" value={String(selected.remainingPoints)} />
                    </div>

                    <div className="stat-grid">
                      <Card label="STR" value={selected.str.toLocaleString()} />
                      <Card label="AGI" value={selected.agi.toLocaleString()} />
                      <Card label="VIT" value={selected.vit.toLocaleString()} />
                      <Card label="INTELLIGENCE" value={selected.intelligence.toLocaleString()} />
                      <Card label="DIVINITY" value={selected.divinity.toLocaleString()} />
                    </div>

                    {isAlok && <div className="canon">Canon profile active: Alok has a unique celestial system panel</div>}
                  </>
                ) : (
                  <div className="skills-list-wrap">
                    <div className="skill-form">
                      <input placeholder="Skill name" value={skillDraft.name} onChange={(event) => setSkillDraft((prev) => ({ ...prev, name: event.target.value }))} />
                      <input placeholder="Skill rank" value={skillDraft.rank} onChange={(event) => setSkillDraft((prev) => ({ ...prev, rank: event.target.value }))} />
                      <input placeholder="Description" value={skillDraft.description} onChange={(event) => setSkillDraft((prev) => ({ ...prev, description: event.target.value }))} />
                      <button onClick={addSkill}>Add Skill</button>
                    </div>
                    <div className="skills-list">
                      {selected.skills.map((skill) => (
                        <div key={skill.id} className="skill-row">
                          <strong>{skill.name} [{skill.rank}]</strong>
                          <span>{skill.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>
          )}
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
