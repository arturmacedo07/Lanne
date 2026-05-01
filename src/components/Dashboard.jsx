import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, CalendarDays, History, MapPin, Clock, User, ChevronDown, ChevronUp, Stethoscope, Activity, Flame } from 'lucide-react'
import { useUserStorage } from '../hooks/useUserStorage'

/* ─── DATA ─────────────────────────────────────────── */
const ACTIVITY_TYPES = {
  ambulatorio: { label: 'Ambulatório', color: '#7c3aed', bg: '#f3f0ff' },
  plantao:     { label: 'Plantão',     color: '#0ea5e9', bg: '#f0f9ff' },
  cirurgia:    { label: 'Cirurgia',    color: '#ef4444', bg: '#fef2f2' },
  sessao:      { label: 'Sessão Clínica', color: '#f59e0b', bg: '#fffbeb' },
  round:       { label: 'Round',       color: '#10b981', bg: '#f0fdf4' },
}

const WEEK_SCHEDULE = [
  { id: 1, day: 'Seg', date: '05/05', activity: 'Ambulatório Neuro', type: 'ambulatorio', preceptor: 'Dr. Eduardo', crm: 'CRM-PE 12345', time: '08:00 – 12:00', duration: 4, loc: 'Hospital das Clínicas – UFPE', floor: '2º andar, Ala B', path: 'Entrar pelo portão principal da Av. Prof. Moraes Rego. Subir pelo elevador central até o 2º andar, virar à esquerda na Ala B.', week: 18 },
  { id: 2, day: 'Ter', date: '06/05', activity: 'Plantão Emergência', type: 'plantao', preceptor: 'Dr. Breno', crm: 'CRM-PE 67890', time: '19:00 – 01:00', duration: 6, loc: 'Hospital da Restauração', floor: 'Emergência – Térreo', path: 'Entrada pela Av. Agamenon Magalhães. Seguir pela guarita da emergência traumato, balcão 4.', week: 18 },
  { id: 3, day: 'Qua', date: '07/05', activity: 'Sessão Clínica',    type: 'sessao',    preceptor: 'Dra. Luciana', crm: 'CRM-PE 11223', time: '11:00 – 13:00', duration: 2, loc: 'HC – Auditório Principal', floor: 'Térreo', path: 'Ao lado da biblioteca central. Apresentar crachá na recepção.', week: 18 },
  { id: 4, day: 'Qui', date: '08/05', activity: 'Centro Cirúrgico',  type: 'cirurgia',  preceptor: 'Dr. Eduardo', crm: 'CRM-PE 12345', time: '07:00 – 13:00', duration: 6, loc: 'Bloco Cirúrgico – HC', floor: '3º andar', path: 'Trocar roupa no vestiário do 3º andar. Chegar com 15 min de antecedência para paramentação.', week: 18 },
  { id: 5, day: 'Sex', date: '09/05', activity: 'Round Enfermaria',  type: 'round',     preceptor: 'Dr. Breno', crm: 'CRM-PE 67890', time: '09:00 – 11:00', duration: 2, loc: 'Enfermaria 4A – HC', floor: '4º andar, Corredor Norte', path: 'Subir pela escada lateral. Enfermaria 4A fica ao final do corredor norte.', week: 18 },
]

const PAST_WEEKS = [
  { week: 16, label: 'Semana 16 · 21–25 Abr', activities: [
    { id: 101, activity: 'Ambulatório Neuro', type: 'ambulatorio', preceptor: 'Dr. Eduardo', duration: 4, day: 'Seg', time: '08:00 – 12:00' },
    { id: 102, activity: 'Sessão Clínica',    type: 'sessao',    preceptor: 'Dra. Luciana', duration: 2, day: 'Qua', time: '11:00 – 13:00' },
  ]},
  { week: 17, label: 'Semana 17 · 28 Abr – 02 Mai', activities: [
    { id: 201, activity: 'Plantão Emergência', type: 'plantao', preceptor: 'Dr. Breno',    duration: 6, day: 'Ter', time: '19:00 – 01:00' },
    { id: 202, activity: 'Round Enfermaria',   type: 'round',   preceptor: 'Dr. Breno',    duration: 2, day: 'Sex', time: '09:00 – 11:00' },
  ]},
]

/* ─── SUB-COMPONENTS ────────────────────────────────── */

function TypeBadge({ type }) {
  const t = ACTIVITY_TYPES[type] || ACTIVITY_TYPES.ambulatorio
  return (
    <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.05em', padding: '3px 8px', borderRadius: '20px', background: t.bg, color: t.color, textTransform: 'uppercase' }}>
      {t.label}
    </span>
  )
}

function KpiCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 2px 12px rgba(75,44,127,0.08)', flex: 1, minWidth: 0 }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: accent + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
        <Icon size={16} color={accent} />
      </div>
      <div style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a2e', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#6b5c85', marginTop: '4px' }}>{label}</div>
      {sub && <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px' }}>{sub}</div>}
    </div>
  )
}

function RingProgress({ pct, color = '#7c3aed', size = 96, stroke = 10 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (Math.min(pct, 100) / 100) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </svg>
  )
}

function ProgressBar({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
        <span style={{ fontWeight: '600', color: '#2d1e42' }}>{label}</span>
        <span style={{ color: '#6b5c85' }}>{value}h de {total}h</span>
      </div>
      <div style={{ height: '6px', background: '#f0ebf8', borderRadius: '99px', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: '99px' }}
        />
      </div>
    </div>
  )
}

function ActivityCard({ item, marked, onToggle, celebrating }) {
  const [expanded, setExpanded] = useState(false)
  const type = ACTIVITY_TYPES[item.type] || ACTIVITY_TYPES.ambulatorio

  return (
    <motion.div
      layout
      whileTap={{ scale: celebrating ? 1.05 : 0.98 }}
      animate={celebrating ? { 
        scale: [1, 1.05, 1],
        boxShadow: ['0 2px 12px rgba(75,44,127,0.08)', '0 8px 30px rgba(255,215,0,0.3)', '0 2px 12px rgba(75,44,127,0.08)']
      } : {}}
      style={{ background: marked ? '#f0fdf4' : 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(75,44,127,0.08)', borderLeft: `5px solid ${marked ? '#10b981' : type.color}`, marginBottom: '12px', border: celebrating ? '2px solid #FFD700' : 'none' }}
    >
      <div onClick={() => setExpanded(!expanded)} style={{ padding: '16px', cursor: 'pointer', display: 'flex', gap: '14px', alignItems: 'center' }}>
        <div style={{ background: marked ? '#dcfce7' : type.bg, borderRadius: '14px', padding: '10px', flexShrink: 0 }}>
          <Stethoscope size={20} color={marked ? '#10b981' : type.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontWeight: '800', fontSize: '15px', color: '#1a1a2e' }}>{item.activity}</span>
            <TypeBadge type={item.type} />
          </div>
          <div style={{ fontSize: '11px', color: '#6b5c85', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>{item.day} {item.date}</span>
            <span>·</span>
            <span>{item.time}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <button onClick={(e) => { e.stopPropagation(); onToggle(item.id) }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: marked ? '#10b981' : '#ddd' }}>
            {marked ? <CheckCircle2 size={26} /> : <Circle size={26} />}
          </button>
          <div style={{ color: '#ccc' }}>{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0 16px 16px', borderTop: '1px solid #f5f5f5', paddingTop: '14px', display: 'grid', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <User size={14} color="#7c3aed" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#2d1e42' }}>{item.preceptor}</div>
                  <div style={{ fontSize: '10px', color: '#aaa' }}>{item.crm}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <MapPin size={14} color="#7c3aed" style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#2d1e42' }}>{item.loc}</div>
                  <div style={{ fontSize: '10px', color: '#6b5c85' }}>{item.floor}</div>
                </div>
              </div>
              <div style={{ background: '#f0ebf8', borderRadius: '10px', padding: '10px 12px', fontSize: '11px', color: '#4b2c7f', lineHeight: 1.6 }}>
                🧭 <strong>Como chegar:</strong> {item.path}
              </div>
              {marked && (
                <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '8px 12px', fontSize: '11px', color: '#065f46', fontWeight: '600' }}>
                  ✅ {item.duration}h confirmadas no seu histórico
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── MAIN ──────────────────────────────────────────── */
export default function Dashboard() {
  const [view, setView] = useState('current')
  const [markedActivities, setMarkedActivities] = useUserStorage('marked_v3', [])
  const [celebrated, setCelebrated] = useState(null)

  const toggleActivity = id => {
    const adding = !markedActivities.includes(id)
    setMarkedActivities(prev => adding ? [...prev, id] : prev.filter(x => x !== id))
    if (adding) { setCelebrated(id); setTimeout(() => setCelebrated(null), 900) }
  }

  // Metrics
  const historicalHours = PAST_WEEKS.flatMap(w => w.activities).reduce((a, b) => a + b.duration, 0)
  const currentWeekHours = WEEK_SCHEDULE.filter(i => markedActivities.includes(i.id)).reduce((a, b) => a + b.duration, 0)
  const totalHours = historicalHours + currentWeekHours
  const totalActivities = PAST_WEEKS.flatMap(w => w.activities).length + markedActivities.length
  const weekScheduledHours = WEEK_SCHEDULE.reduce((a, b) => a + b.duration, 0)
  const weekRingPct = weekScheduledHours > 0 ? Math.round((currentWeekHours / weekScheduledHours) * 100) : 0

  // Hours by type
  const hoursByType = {}
  WEEK_SCHEDULE.filter(i => markedActivities.includes(i.id)).forEach(i => {
    hoursByType[i.type] = (hoursByType[i.type] || 0) + i.duration
  })

  const streak = 2

  // Today spotlight (mock: Qua = index 2)
  const todayItem = WEEK_SCHEDULE[2]

  return (
    <div className="animate-slide-up" style={{ paddingBottom: '8px' }}>

      {/* ── HERO CARD ── */}
      <div style={{ background: 'linear-gradient(135deg, #3b1f6e 0%, #5c35a0 60%, #7c3aed 100%)', borderRadius: '24px', padding: '24px', marginBottom: '20px', position: 'relative', overflow: 'hidden', color: 'white' }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '140px', height: '140px', background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-20px', left: '40%', width: '80px', height: '80px', background: 'rgba(255,215,0,0.08)', borderRadius: '50%' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.65, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Semana 18 · Maio 2026</div>
            <div style={{ fontSize: '30px', fontWeight: '900', lineHeight: 1 }}>{totalHours}h</div>
            <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '4px' }}>horas acumuladas no semestre</div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '18px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '800' }}>{currentWeekHours}h</div>
                <div style={{ fontSize: '10px', opacity: 0.6 }}>Semana atual</div>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }} />
              <div>
                <div style={{ fontSize: '16px', fontWeight: '800' }}>{historicalHours}h</div>
                <div style={{ fontSize: '10px', opacity: 0.6 }}>Semanas passadas</div>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }} />
              <div>
                <div style={{ fontSize: '16px', fontWeight: '800' }}>{totalActivities}</div>
                <div style={{ fontSize: '10px', opacity: 0.6 }}>Atividades</div>
              </div>
            </div>
          </div>
          {/* Ring — horas da semana */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <RingProgress pct={weekRingPct} color="#FFD700" size={90} stroke={9} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: '900', lineHeight: 1 }}>{currentWeekHours}h</div>
              <div style={{ fontSize: '8px', opacity: 0.65 }}>/{weekScheduledHours}h</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── HOJE SPOTLIGHT ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        onClick={() => toggleActivity(todayItem.id)}
        whileTap={{ scale: 0.97 }}
        style={{ background: 'white', borderRadius: '18px', padding: '16px 18px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(75,44,127,0.12)', borderLeft: `5px solid ${markedActivities.includes(todayItem.id) ? '#10b981' : ACTIVITY_TYPES[todayItem.type]?.color}`, display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', background: markedActivities.includes(todayItem.id) ? '#f8fff8' : 'white' }}
      >
        <div style={{ background: markedActivities.includes(todayItem.id) ? '#dcfce7' : ACTIVITY_TYPES[todayItem.type]?.bg, borderRadius: '12px', padding: '10px', flexShrink: 0 }}>
          <Stethoscope size={20} color={markedActivities.includes(todayItem.id) ? '#10b981' : ACTIVITY_TYPES[todayItem.type]?.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', color: markedActivities.includes(todayItem.id) ? '#10b981' : ACTIVITY_TYPES[todayItem.type]?.color, marginBottom: '2px' }}>📍 Hoje</div>
          <div style={{ fontWeight: '800', fontSize: '15px', color: '#1a1a2e' }}>{todayItem.activity}</div>
          <div style={{ fontSize: '11px', color: '#6b5c85', marginTop: '2px' }}>{todayItem.time} · {todayItem.preceptor} · {todayItem.floor}</div>
        </div>
        {markedActivities.includes(todayItem.id)
          ? <CheckCircle2 size={26} color="#10b981" />
          : <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 2 }}><Circle size={26} color="#ddd" /></motion.div>
        }
      </motion.div>

      {/* ── KPI SECTION ── */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '25px' }}>
        <KpiCard icon={Flame} label="Streak" value={`${streak} dias`} accent="#f59e0b" />
        <KpiCard icon={Activity} label="Carga Horária" value={`${totalHours}h`} sub="Total acumulado" accent="#ef4444" />
      </div>

      {/* ── TABS ── */}
      <div style={{ display: 'flex', background: '#f3f0ff', borderRadius: '14px', padding: '4px', marginBottom: '16px' }}>
        <button onClick={() => setView('current')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: view === 'current' ? 'white' : 'transparent', color: view === 'current' ? '#4b2c7f' : '#6b5c85', fontWeight: view === 'current' ? '700' : '500', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', boxShadow: view === 'current' ? '0 2px 8px rgba(75,44,127,0.12)' : 'none' }}>
          <CalendarDays size={16} /> Escala da Semana
        </button>
        <button onClick={() => setView('history')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: view === 'history' ? 'white' : 'transparent', color: view === 'history' ? '#4b2c7f' : '#6b5c85', fontWeight: view === 'history' ? '700' : '500', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', boxShadow: view === 'history' ? '0 2px 8px rgba(75,44,127,0.12)' : 'none' }}>
          <History size={16} /> Atividades Passadas
        </button>
      </div>

      <AnimatePresence mode="wait">
        {view === 'current' ? (
          <motion.div key="current" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#6b5c85', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cronograma Atual</span>
              <span style={{ fontSize: '11px', color: '#aaa' }}>{WEEK_SCHEDULE.length} atividades previstas</span>
            </div>
            {WEEK_SCHEDULE.map(item => (
              <ActivityCard key={item.id} item={item} marked={markedActivities.includes(item.id)} onToggle={toggleActivity} celebrating={celebrated === item.id} />
            ))}
          </motion.div>
        ) : (
          <motion.div key="history" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            {PAST_WEEKS.map(week => (
              <div key={week.week} style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#4b2c7f', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '4px', height: '16px', background: '#7c3aed', borderRadius: '2px' }} />
                  {week.label}
                </div>
                {week.activities.map(act => (
                  <div key={act.id} style={{ background: 'white', borderRadius: '16px', padding: '14px', marginBottom: '8px', display: 'flex', gap: '12px', alignItems: 'center', border: '1px solid #f0f0f0' }}>
                    <div style={{ background: ACTIVITY_TYPES[act.type]?.bg, borderRadius: '10px', padding: '8px' }}>
                      <Stethoscope size={16} color={ACTIVITY_TYPES[act.type]?.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#1a1a2e' }}>{act.activity}</div>
                      <div style={{ fontSize: '11px', color: '#6b5c85' }}>{act.day} · {act.time} · {act.preceptor}</div>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#10b981' }}>+{act.duration}h</div>
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
