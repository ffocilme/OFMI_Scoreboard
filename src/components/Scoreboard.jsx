import React, { useState, useEffect, useCallback } from 'react';
import * as sb from '../utils/ScoreboardUtils.jsx';
import * as api from '../utils/ApiFetch.jsx';
import MedalSelector from './MedalSelector.jsx';
import ExportData from './ExportData.jsx';

const POLL_INTERVAL = 30_000;

/* ─── Palette ─────────────────────────────────────────────────── */
const C = {
  gold:      '#d4a017',
  goldBg:    '#fffbeb',
  goldBgDark: '#2a1f08',
  silver:    '#6b7280',
  silverBg:  '#f3f4f6',
  silverBgDk: '#1e252d',
  bronze:    '#92400e',
  bronzeBg:  '#fff7ed',
  bronzeBgDk: '#20120a',
  diploma:   '#1d4ed8',
  diplomaBg: '#eff6ff',
  diplomaBgDk:'#0b1225',
  successBg: '#16a34a',
  successText:'#ffffff',
  partialBg: '#ca8a04',
  partialText:'#ffffff',
  failText:  '#ef4444',
  live:      '#16a34a',
};

const medalMeta = {
  gold:    { color: C.gold,    bgLight: C.goldBg,    bgDark: C.goldBgDark,    emoji: '🥇', label: 'Oro' },
  silver:  { color: C.silver,  bgLight: C.silverBg,  bgDark: C.silverBgDk,    emoji: '🥈', label: 'Plata' },
  bronze:  { color: C.bronze,  bgLight: C.bronzeBg,  bgDark: C.bronzeBgDk,    emoji: '🥉', label: 'Bronce' },
  diploma: { color: C.diploma, bgLight: C.diplomaBg, bgDark: C.diplomaBgDk,   emoji: '🎖️', label: 'Diploma' },
  none:    { color: '',        bgLight: '',          bgDark: '',              emoji: '',    label: '' },
};

const fmtTime = (d) =>
  d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

/* ─── OFMI username parser (Todoterreno) ──────────────────────── */
function parseUsername(rawText) {
  if (!rawText) return { isOfmi: false, sede: null, num: null, name: '' };
  
  let isOfmi = false;
  let sede = null;
  let num = null;
  let name = '';

  // 1. Extraer SEDE-NUM (Ej. BUAP-01, cdmx-02) sin importar dónde esté
  const sedeMatch = rawText.match(/([A-Za-z0-9]+)-(\d+)/);
  if (sedeMatch) {
    isOfmi = true;
    sede = sedeMatch[1].toUpperCase();
    num = sedeMatch[2];
  }

  // 2. Extraer el nombre real
  const parentesisMatch = rawText.match(/\(([^)]+)\)/);
  if (parentesisMatch) {
    // Si viene entre paréntesis: (Magali Tochihuitl García)
    name = parentesisMatch[1].trim();
  } else {
    // Si la API no mandó paréntesis, limpiamos el prefijo y la sede para aislar el nombre
    let plain = rawText.replace(/^[^:]+:/, '').trim(); 
    if (sedeMatch) plain = plain.replace(sedeMatch[0], '').trim();
    
    // Si después de limpiar quedó texto, ese es el nombre. Si no, usamos la sede como fallback.
    name = plain.length > 0 ? plain : (sedeMatch ? sedeMatch[0] : rawText);
  }

  return { isOfmi, sede, num, name };
}

/* ─── Problem cell ─────────────────────────────────────────────── */
function ProbCell({ cell }) {
  const pts = cell?.value ?? '';
  const isEmpty = pts === '' || pts === undefined || pts === null;
  const n = Number(pts);

  let bg = 'transparent', color = 'inherit', fontWeight = 400;

  if (!isEmpty) {
    if (n >= 100)     { bg = C.successBg; color = C.successText; fontWeight = 700; }
    else if (n > 0)   { bg = C.partialBg; color = C.partialText; fontWeight = 600; }
    else              { color = C.failText; fontWeight = 500; }
  }

  return (
    <td title={cell?.title ?? ''} style={{
      padding: '0', textAlign: 'center', minWidth: 52,
      background: bg,
    }}>
      <div style={{
        padding: '0.6rem 0.4rem',
        fontFamily: 'monospace', fontWeight, fontSize: '0.9rem', color,
      }}>
        {isEmpty ? <span style={{ opacity: 0.2 }}>·</span> : pts}
      </div>
    </td>
  );
}

/* ─── Table row ────────────────────────────────────────────────── */
function Row({ row, problems, isDark }) {
  const [hover, setHover] = useState(false);
  const medal = row.medal;
  const meta  = medalMeta[medal] || medalMeta.none;

  const byKey = {};
  row.cells.forEach(c => { byKey[c.key] = c; });
  const probCells = problems.map((_, i) => row.cells.find(c => c.key === i));

  const rankCell  = byKey['place'];
  const nameCell  = byKey['name'];
  const totalCell = byKey['total'];

  // Concatenamos title y value. En omegaUp a veces el nombre viene en 'value' 
  // y el username en 'title'. Juntarlos asegura que tengamos la info completa sin perder nada.
  const rawUsername = `${nameCell?.title || ''} ${nameCell?.value || ''}`;
  const parsed = parseUsername(rawUsername);

  // Strip emoji from display name
  const displayName = parsed.name.replace(/[\u{1F3C5}\u{1F947}-\u{1F949}\u{1F396}]/gu, '').trim();

  const medalBg = medal !== 'none'
    ? (isDark ? meta.bgDark : meta.bgLight)
    : '';

  const rowBg = hover
    ? (medal !== 'none' ? medalBg + (isDark ? 'ee' : '') : (isDark ? '#ffffff0a' : '#00000005'))
    : medalBg;

  return (
    <tr
      style={{ background: rowBg, transition: 'background 0.12s', cursor: 'default' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Rank */}
      <td style={{
        padding: '0.7rem 0.85rem', textAlign: 'center', width: 64,
        fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem',
        color: medal !== 'none' ? meta.color : undefined,
        borderBottom: isDark ? '1px solid #1e2330' : '1px solid #e5e7eb',
      }}>
        {meta.emoji && <span style={{ marginRight: 3 }}>{meta.emoji}</span>}
        {rankCell?.value ?? '—'}
      </td>

      {/* Name + sede */}
      <td style={{
        padding: '0.7rem 0.85rem', textAlign: 'left',
        borderBottom: isDark ? '1px solid #1e2330' : '1px solid #e5e7eb',
      }}>
        <div style={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.3 }}>
          {displayName}
        </div>
        {parsed.isOfmi && displayName !== `${parsed.sede}-${parsed.num}` && (
          <div style={{ fontSize: '0.75rem', opacity: 0.55, marginTop: 1, fontFamily: 'monospace' }}>
            {parsed.sede}-{parsed.num}
          </div>
        )}
      </td>

      {/* Problems */}
      {probCells.map((c, i) => (
        <ProbCell key={i} cell={c} />
      ))}

      {/* Total */}
      <td style={{
        padding: '0.7rem 0.85rem', textAlign: 'center',
        fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem',
        color: medal !== 'none' ? meta.color : undefined,
        borderLeft: isDark ? '1px solid #2a3048' : '1px solid #d1d5db',
        borderBottom: isDark ? '1px solid #1e2330' : '1px solid #e5e7eb',
        whiteSpace: 'nowrap',
      }} title={totalCell?.title}>
        {totalCell?.value ?? '—'}
      </td>
    </tr>
  );
}

/* ─── Main component ───────────────────────────────────────────── */
export default function Scoreboard({
  link,
  gold      = 0,
  silver    = 0,
  bronze    = 0,
  criteria    = 'medals',
  diploma     = false,
  diplomaCriteria = 'points',
  minScore    = 0,
  title: titleProp = '',
  admin       = false,
}) {
  const [problems,     setProblems]   = useState([]);
  const [scoreboards,  setScoreboards] = useState([]);
  const [contestTitle, setTitle]       = useState(titleProp);
  const [running,      setRunning]     = useState(false);
  const [lastUpdated,  setLastUpdated] = useState(null);
  const [isLoading,    setIsLoading]   = useState(true);
  const [isError,      setIsError]     = useState(false);
  const [countdown,    setCountdown]   = useState(POLL_INTERVAL / 1000);
  const [isDark,       setIsDark]      = useState(() =>
    window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  );

  const [goldT,   setGoldT]   = useState(gold);
  const [silverT, setSilverT] = useState(silver);
  const [bronzeT, setBronzeT] = useState(bronze);
  const [crit,    setCrit]    = useState(criteria);
  const [dipl,    setDipl]    = useState(diploma);
  const [diplCr,  setDiplCr]  = useState(diplomaCriteria);
  const [minSc,   setMinSc]   = useState(minScore);

  const [sedeFilter, setSedeFilter] = useState('all');

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setIsDark(e.matches);
    mq.addEventListener('change', handler);

    const muiCheck = () => {
      const root = document.documentElement;
      const muiMode = root.getAttribute('data-mui-color-scheme') ||
                      (root.classList.contains('dark') ? 'dark' : null);
      if (muiMode) setIsDark(muiMode === 'dark');
    };
    muiCheck();
    const obs = new MutationObserver(muiCheck);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-mui-color-scheme', 'style'] });

    return () => { mq.removeEventListener('change', handler); obs.disconnect(); };
  }, []);

const loadData = useCallback(async () => {
    try {
      // 1. Intentamos obtener la data
      const data = await api.fetchAPI(link);
      
      // 2. Validación defensiva: si el payload no es válido, no sobrescribimos nada
      if (!data || !data.scoreboard || !data.scoreboard.ranking) {
        throw new Error("Formato de datos inválido");
      }

      const payload = data.scoreboard;
      const now     = new Date();
      const start   = new Date(payload.start_time * 1000);
      const end     = new Date(payload.finish_time * 1000);

      // 3. Actualizamos estados solo si los datos son correctos
      setTitle(data.contest?.title || titleProp);
      
      const ranking = sb.formatScoreboard(Object.values(payload.ranking));
      
      // Solo actualizamos si obtuvimos resultados
      if (ranking && ranking.length > 0) {
        setScoreboards(ranking);
      }
      
      setProblems(payload.problems || []);
      setRunning(now >= start && now <= end);
      setLastUpdated(now);
      setIsError(false);
      setCountdown(POLL_INTERVAL / 1000);
      
    } catch (e) {
      console.error("Error al refrescar scoreboard:", e);
      // No seteamos setIsError(true) aquí para no borrar la tabla actual
      // Solo logeamos el error para que el usuario siga viendo los datos previos
    } finally {
      setIsLoading(false);
    }
  }, [link, titleProp]); // Asegúrate de incluir titleProp

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    setGoldT(gold); setSilverT(silver); setBronzeT(bronze);
    setCrit(criteria); setDipl(diploma); setDiplCr(diplomaCriteria); setMinSc(minScore);
  }, [gold, silver, bronze, criteria, diploma, diplomaCriteria, minScore]);

  useEffect(() => {
    if (!running) return;
    const poll = setInterval(loadData, POLL_INTERVAL);
    const tick = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => { clearInterval(poll); clearInterval(tick); };
  }, [running, loadData]);

  const allRows = sb.getRows(scoreboards, crit, goldT, silverT, bronzeT, dipl, diplCr, minSc);

  // Detect OFMI format combinando valores
  const isOfmi = allRows.some(r => {
    const nc = r.cells.find(c => c.key === 'name');
    const rawData = `${nc?.title || ''} ${nc?.value || ''}`;
    return parseUsername(rawData).isOfmi;
  });

  // Collect unique sedes
  const sedes = isOfmi
    ? [...new Set(allRows.map(r => {
        const nc = r.cells.find(c => c.key === 'name');
        const rawData = `${nc?.title || ''} ${nc?.value || ''}`;
        return parseUsername(rawData).sede;
      }).filter(Boolean))].sort()
    : [];

  // Apply sede filter
  const rows = sedeFilter === 'all' || !isOfmi
    ? allRows
    : allRows.filter(r => {
        const nc = r.cells.find(c => c.key === 'name');
        const rawData = `${nc?.title || ''} ${nc?.value || ''}`;
        return parseUsername(rawData).sede === sedeFilter;
      });

  const medalCounts = { gold: 0, silver: 0, bronze: 0, diploma: 0 };
  rows.forEach(r => { if (r.medal in medalCounts) medalCounts[r.medal]++; });

  const problemLetters = problems.map((_, i) => String.fromCharCode(65 + i));

  const bg      = isDark ? '#0d0f14'  : '#f8fafc';
  const surface = isDark ? '#13161e'  : '#ffffff';
  const border  = isDark ? '#1e2330'  : '#e5e7eb';
  const borderHi= isDark ? '#2a3048'  : '#d1d5db';
  const textMain= isDark ? '#e2e8f0'  : '#111827';
  const textMut = isDark ? '#64748b'  : '#6b7280';
  const textDim = isDark ? '#94a3b8'  : '#9ca3af';
  const accent  = '#6366f1';

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.35)} }
    @keyframes spin   { to{transform:rotate(360deg)} }
    .sb-root *, .sb-root *::before, .sb-root *::after { box-sizing: border-box; }
    .sb-root ::-webkit-scrollbar { height: 6px; width: 6px; background: ${bg}; }
    .sb-root ::-webkit-scrollbar-thumb { background: ${border}; border-radius: 3px; }
    .sb-root table { border-spacing: 0; }
    .sb-filter-btn { padding: 0.3rem 0.75rem; border-radius: 999px; font-size: 0.78rem; font-weight: 500; cursor: pointer; transition: all 0.12s; border: 1px solid ${border}; }
    .sb-filter-btn.active { background: ${accent}; color: white; border-color: ${accent}; }
    .sb-filter-btn:not(.active) { background: transparent; color: ${textMut}; }
    .sb-filter-btn:not(.active):hover { border-color: ${accent}; color: ${textMain}; }
    .sb-refresh-btn { padding: 0.35rem 0.9rem; font-size: 0.8rem; border-radius: 6px; border: 1px solid ${border}; background: transparent; color: ${textDim}; cursor: pointer; transition: all 0.12s; }
    .sb-refresh-btn:hover { border-color: ${accent}; color: ${textMain}; }
  `;

  const thStyle = {
    padding: '0.55rem 0.7rem',
    textAlign: 'center',
    fontWeight: 600,
    fontSize: '0.72rem',
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    color: textMut,
    background: surface,
    borderBottom: `2px solid ${border}`,
    position: 'sticky',
    top: 0,
    zIndex: 2,
    whiteSpace: 'nowrap',
  };

  if (isLoading) return (
    <div className="sb-root" style={{ background: bg, minHeight: '50vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'1rem', color: textMut, fontFamily:"'Inter',system-ui,sans-serif" }}>
      <style>{css}</style>
      <div style={{ width:36, height:36, border:`3px solid ${border}`, borderTop:`3px solid ${accent}`, borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <span style={{ fontSize:'0.9rem' }}>Cargando scoreboard…</span>
    </div>
  );

  if (isError) return (
    <div className="sb-root" style={{ background: bg, minHeight: '50vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'1rem', color: textMut, fontFamily:"'Inter',system-ui,sans-serif" }}>
      <style>{css}</style>
      <span style={{ fontSize:'2rem' }}>⚠️</span>
      <span>No se pudo cargar el scoreboard.</span>
      <button className="sb-refresh-btn" onClick={loadData}>Reintentar</button>
    </div>
  );

  return (
    <div className="sb-root" style={{ background: bg, color: textMain, fontFamily:"'Inter',system-ui,sans-serif", minHeight: '100vh' }}>
      <style>{css}</style>

      {/* ── HEADER ── */}
      <div style={{ background: surface, borderBottom: `1px solid ${border}`, padding: '1.25rem 1.75rem', display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'1rem', flexWrap:'wrap' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem' }}>
          <h1 style={{ margin:0, fontSize:'clamp(1.1rem,3vw,1.6rem)', fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.2, color: textMain }}>
            {contestTitle || 'Scoreboard'}
          </h1>
          <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', flexWrap:'wrap' }}>
            <span style={{
              display:'inline-flex', alignItems:'center', gap:'0.35rem', padding:'2px 10px', borderRadius:'999px',
              fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase',
              background: running ? '#16a34a18' : (isDark ? '#1e202880' : '#f3f4f680'),
              color: running ? C.live : textMut,
              border:`1px solid ${running ? C.live+'44' : border}`,
            }}>
              {running && <span style={{ width:7, height:7, borderRadius:'50%', background:C.live, animation:'pulse 1.4s ease-in-out infinite', display:'inline-block' }} />}
              {running ? 'En curso' : 'Terminado'}
            </span>
            {lastUpdated && (
              <span style={{ fontSize:'0.77rem', color: textMut }}>
                {fmtTime(lastUpdated)}{running ? ` · refresca en ${countdown}s` : ''}
              </span>
            )}
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
          {Object.entries(medalCounts).map(([m, n]) => n > 0 && (
            <span key={m} style={{ color: medalMeta[m].color, fontSize:'0.82rem', fontWeight:600, display:'flex', alignItems:'center', gap:'0.25rem' }}>
              {medalMeta[m].emoji} {n}
            </span>
          ))}
          <button className="sb-refresh-btn" onClick={loadData}>↻ Actualizar</button>
        </div>
      </div>

      {/* ── ADMIN MEDAL SELECTOR ── */}
      {admin && (
        <div style={{ background: surface, borderBottom: `1px solid ${border}`, padding: '0.75rem 1.75rem' }}>
          <MedalSelector
            onChangeThresholds={(c, g, s, b, d, dc, ms) => {
              setCrit(c); setGoldT(g); setSilverT(s); setBronzeT(b);
              setDipl(d); setDiplCr(dc); setMinSc(ms);
            }}
            gold={goldT} silver={silverT} bronze={bronzeT}
            criteria={crit} diploma={dipl} diplomaCriteria={diplCr} minScore={minSc}
          />
        </div>
      )}

      {/* ── SEDE FILTER (OFMI only) ── */}
      {isOfmi && sedes.length > 1 && (
        <div style={{ background: surface, borderBottom: `1px solid ${border}`, padding: '0.6rem 1.75rem', display:'flex', gap:'0.5rem', flexWrap:'wrap', alignItems:'center' }}>
          <span style={{ fontSize:'0.75rem', color: textMut, fontWeight:600, marginRight:'0.25rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>Sede</span>
          <button className={`sb-filter-btn ${sedeFilter === 'all' ? 'active' : ''}`} onClick={() => setSedeFilter('all')}>
            Todas
          </button>
          {sedes.map(s => (
            <button key={s} className={`sb-filter-btn ${sedeFilter === s ? 'active' : ''}`} onClick={() => setSedeFilter(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── TABLE ── */}
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.9rem', minWidth: 480 }}>
          <thead>
            <tr>
              <th style={thStyle}>#</th>
              <th style={{ ...thStyle, textAlign:'left' }}>Participante</th>
              {problemLetters.map(l => <th key={l} style={thStyle}>{l}</th>)}
              <th style={{ ...thStyle, borderLeft:`1px solid ${borderHi}` }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3 + problems.length} style={{ padding:'3rem', textAlign:'center', color: textMut, fontSize:'0.9rem' }}>
                  {sedeFilter !== 'all' ? `Sin participantes de ${sedeFilter}` : 'Sin participantes aún'}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <Row key={row.key} row={row} problems={problems} isDark={isDark} index={i} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ padding:'0.65rem 1.75rem', fontSize:'0.75rem', color: textMut, borderTop:`1px solid ${border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.5rem', background: surface }}>
        <span>
          {rows.length} participante{rows.length !== 1 ? 's' : ''}
          {sedeFilter !== 'all' ? ` en ${sedeFilter}` : ''}
          {' · '}{problems.length} problema{problems.length !== 1 ? 's' : ''}
        </span>
        <div style={{ display:'flex', gap:'1rem', alignItems:'center', flexWrap:'wrap' }}>
          {Object.entries(medalMeta).filter(([k]) => k !== 'none').map(([k, v]) => (
            <span key={k} style={{ color: v.color, fontWeight:500 }}>{v.emoji} {v.label}</span>
          ))}
          {admin && <ExportData columns={[]} rows={rows} title={contestTitle} />}
        </div>
      </div>
    </div>
  );
}