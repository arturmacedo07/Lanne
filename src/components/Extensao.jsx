import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, MapPin, Clock, ChevronDown, ChevronUp, CheckCircle2, Circle, Calendar, Users, Trash2 } from 'lucide-react'
import { useUserStorage } from '../hooks/useUserStorage'

/* ─── CONFIG ─────────────────────────────────────── */
const CATEGORIES = {
  acao_social: { label: 'Ação Social',  color: '#10b981', bg: '#f0fdf4', emoji: '🫂' },
  jornada:     { label: 'Jornada',      color: '#0ea5e9', bg: '#f0f9ff', emoji: '🎓' },
  workshop:    { label: 'Workshop',     color: '#8b5cf6', bg: '#f5f3ff', emoji: '🛠' },
  simposio:    { label: 'Simpósio',     color: '#f59e0b', bg: '#fffbeb', emoji: '🏛' },
  campanha:    { label: 'Campanha',     color: '#ef4444', bg: '#fef2f2', emoji: '📢' },
  outro:       { label: 'Outro',        color: '#6b7280', bg: '#f9fafb', emoji: '📌' },
}

const MOCK_EVENTS = [
  { id: 1, title: 'Simpósio LANNE 2026', category: 'simposio', date: '2026-05-15', time: '08:00 – 17:00', location: 'Auditório Central – UFPE', floor: 'Térreo, bloco A', path: 'Entrada pela Av. Prof. Moraes Rego. O auditório fica logo na entrada principal do campus.', description: 'Simpósio anual da LANNE com palestras sobre Neurologia e Neurocirurgia. Vagas limitadas.', vagas: 80 },
  { id: 2, title: 'Ação Social: Dia Mundial do AVC', category: 'acao_social', date: '2026-06-10', time: '09:00 – 14:00', location: 'Praça da República', floor: 'Área central', path: 'Ponto de encontro no coreto central às 8h45 para distribuição de materiais antes do início.', description: 'Ação de conscientização sobre o AVC com triagem de PA, glicemia e orientação à população.', vagas: 20 },
  { id: 3, title: 'Workshop: Interpretação de Neuroimagem', category: 'workshop', date: '2026-05-28', time: '14:00 – 18:00', location: 'Sala de Aula 302 – HC', floor: '3º andar', path: 'Entrar pelo HC, subir pela escada central, sala 302 no final do corredor.', description: 'Workshop prático de interpretação de TC e RM de crânio. Mínimo de 10 participantes.', vagas: 15 },
  { id: 4, title: 'Jornada de Neurocirurgia', category: 'jornada', date: '2026-07-05', time: '08:00 – 18:00', location: 'Hotel Boa Viagem – Sala 1', floor: '1º andar', path: 'Hotel localizado na Av. Boa Viagem, 3720. Estacionamento disponível. Sala 1 fica na entrada.', description: 'Jornada estadual de Neurocirurgia com convidados nacionais. Certificado de 8h.', vagas: 120 },
]

/* ─── HELPERS ─────────────────────────────────────── */
function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = new Date(dateStr + 'T00:00:00') - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function CountdownBadge({ dateStr }) {
  const days = daysUntil(dateStr)
  if (days === null) return null
  if (days < 0) return <span style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: '99px' }}>Encerrado</span>
  if (days === 0) return <span style={{ fontSize: '10px', fontWeight: '800', color: '#ef4444', background: '#fef2f2', padding: '2px 8px', borderRadius: '99px' }}>Hoje!</span>
  const color = days <= 3 ? '#ef4444' : days <= 7 ? '#f97316' : days <= 14 ? '#f59e0b' : '#10b981'
  const bg = days <= 3 ? '#fef2f2' : days <= 7 ? '#fff7ed' : days <= 14 ? '#fffbeb' : '#f0fdf4'
  return <span style={{ fontSize: '10px', fontWeight: '800', color, background: bg, padding: '2px 8px', borderRadius: '99px' }}>{days}d</span>
}

function CatBadge({ category }) {
  const c = CATEGORIES[category] || CATEGORIES.outro
  return <span style={{ fontSize: '10px', fontWeight: '700', color: c.color, background: c.bg, padding: '2px 8px', borderRadius: '99px' }}>{c.emoji} {c.label}</span>
}

function Modal({ title, onClose, children }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        style={{ background: 'white', borderRadius: '24px', width: '90vw', maxWidth: '360px', height: '420px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 10px', flexShrink: 0, borderBottom: '1px solid #f0f0f0' }}>
          <h3 style={{ fontWeight: '800', fontSize: '17px', color: '#1a1a2e', margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  )
}

const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1.5px solid #eee', fontSize: '14px', fontFamily: 'inherit', outline: 'none', background: '#fafafa', boxSizing: 'border-box', marginBottom: '12px' }

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '4px' }}>
      <label style={{ fontSize: '11px', fontWeight: '700', color: '#6b5c85', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>{label}</label>
      {children}
    </div>
  )
}

/* ─── EVENT CARD ─────────────────────────────────── */
function EventCard({ event, confirmed, onToggleConfirm, onDelete }) {
  const [open, setOpen] = useState(false)
  const cat = CATEGORIES[event.category] || CATEGORIES.outro
  const days = daysUntil(event.date)
  const isPast = days !== null && days < 0
  const isToday = days === 0
  const dateObj = new Date(event.date + 'T00:00:00')

  return (
    <motion.div layout style={{
      background: 'white', borderRadius: '18px', overflow: 'hidden',
      boxShadow: '0 2px 14px rgba(75,44,127,0.08)',
      borderLeft: `4px solid ${isPast ? '#e5e7eb' : cat.color}`,
      marginBottom: '10px',
      opacity: isPast ? 0.65 : 1
    }}>
      {/* Header */}
      <div onClick={() => setOpen(o => !o)} style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        {/* Date badge */}
        <div style={{ background: isPast ? '#f1f5f9' : cat.bg, borderRadius: '12px', padding: '8px 10px', textAlign: 'center', minWidth: '46px', flexShrink: 0 }}>
          <div style={{ fontSize: '18px', fontWeight: '900', color: isPast ? '#94a3b8' : cat.color, lineHeight: 1 }}>
            {String(dateObj.getDate()).padStart(2, '0')}
          </div>
          <div style={{ fontSize: '9px', textTransform: 'uppercase', color: isPast ? '#94a3b8' : cat.color, opacity: 0.8 }}>
            {dateObj.toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '5px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: '800', fontSize: '14px', color: '#1a1a2e', lineHeight: 1.3 }}>{event.title}</span>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <CatBadge category={event.category} />
            <CountdownBadge dateStr={event.date} />
            {confirmed && !isPast && <span style={{ fontSize: '10px', fontWeight: '700', color: '#10b981', background: '#f0fdf4', padding: '2px 8px', borderRadius: '99px' }}>✓ Confirmado</span>}
          </div>
          <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#6b5c85', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={11} /> {event.time}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={11} /> {event.location}</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {!isPast && (
            <button onClick={e => { e.stopPropagation(); onToggleConfirm(event.id) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: confirmed ? '#10b981' : '#d1d5db', lineHeight: 0 }}>
              {confirmed ? <CheckCircle2 size={24} /> : <motion.div animate={{ scale: [1, 1.07, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}><Circle size={24} /></motion.div>}
            </button>
          )}
          <div style={{ color: '#ccc' }}>{open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</div>
        </div>
      </div>

      {/* Expandable */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ borderTop: '1px solid #f5f5f5', padding: '14px 16px', display: 'grid', gap: '10px' }}>
              {event.description && (
                <div style={{ background: '#fafafa', borderRadius: '10px', padding: '10px 12px', fontSize: '12px', color: '#4b5563', lineHeight: 1.6 }}>
                  {event.description}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <MapPin size={14} color={cat.color} style={{ marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#1a1a2e' }}>{event.location}</div>
                  {event.floor && <div style={{ fontSize: '11px', color: '#6b5c85' }}>{event.floor}</div>}
                </div>
              </div>
              {event.path && (
                <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '10px 12px', fontSize: '11px', color: '#065f46', lineHeight: 1.6 }}>
                  🧭 <strong>Como chegar:</strong> {event.path}
                </div>
              )}
              {event.vagas && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#6b5c85' }}>
                  <Users size={13} /> <span>Capacidade: <strong>{event.vagas} vagas</strong></span>
                </div>
              )}
              <button onClick={() => onDelete(event.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', padding: 0 }}>
                <Trash2 size={13} /> Remover evento
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── MAIN ────────────────────────────────────────── */
const BLANK_FORM = { title: '', category: 'acao_social', date: '', time: '', location: '', floor: '', path: '', description: '', vagas: '' }

export default function Extensao() {
  const [events, setEvents] = useUserStorage('events_v2', MOCK_EVENTS)
  const [confirmed, setConfirmed] = useUserStorage('ext_confirmed', [])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(BLANK_FORM)
  const [filter, setFilter] = useState('all') // 'all' | 'upcoming' | 'past'

  const toggleConfirm = id => setConfirmed(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const addEvent = () => {
    if (!form.title || !form.date) return
    setEvents(ev => [...ev, { ...form, id: Date.now(), vagas: form.vagas ? parseInt(form.vagas) : null }])
    setForm(BLANK_FORM)
    setShowModal(false)
  }

  const sorted = [...events].sort((a, b) => new Date(a.date) - new Date(b.date))
  const upcoming = sorted.filter(e => daysUntil(e.date) >= 0)
  const past = sorted.filter(e => daysUntil(e.date) < 0)
  const nextEvent = upcoming[0]
  const filtered = filter === 'upcoming' ? upcoming : filter === 'past' ? past : sorted

  return (
    <div className="animate-slide-up" style={{ paddingBottom: '8px' }}>

      {/* ── HERO ── */}
      <div style={{ background: 'linear-gradient(135deg, #064e3b 0%, #059669 60%, #34d399 100%)', borderRadius: '22px', padding: '22px', marginBottom: '20px', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
        <div style={{ fontSize: '11px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Extensão Comunitária</div>
        <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '14px' }}>Agenda LANNE</h2>
        <div style={{ display: 'flex', gap: '18px' }}>
          <div><div style={{ fontSize: '22px', fontWeight: '900' }}>{upcoming.length}</div><div style={{ fontSize: '10px', opacity: 0.7 }}>Próximos</div></div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }} />
          <div><div style={{ fontSize: '22px', fontWeight: '900' }}>{confirmed.filter(id => events.find(e => e.id === id && daysUntil(e.date) >= 0)).length}</div><div style={{ fontSize: '10px', opacity: 0.7 }}>Confirmados</div></div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }} />
          <div><div style={{ fontSize: '22px', fontWeight: '900' }}>{past.length}</div><div style={{ fontSize: '10px', opacity: 0.7 }}>Realizados</div></div>
        </div>
      </div>

      {/* ── PRÓXIMO EVENTO SPOTLIGHT ── */}
      {nextEvent && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>📅 Próximo Evento</div>
          <div
            onClick={() => toggleConfirm(nextEvent.id)}
            style={{ background: 'white', borderRadius: '18px', padding: '16px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(5,150,105,0.14)', borderLeft: `5px solid ${CATEGORIES[nextEvent.category]?.color || '#10b981'}`, cursor: 'pointer', display: 'flex', gap: '14px', alignItems: 'center' }}
          >
            <div style={{ background: CATEGORIES[nextEvent.category]?.bg, borderRadius: '14px', padding: '12px', flexShrink: 0, textAlign: 'center', minWidth: '52px' }}>
              <div style={{ fontSize: '20px', fontWeight: '900', color: CATEGORIES[nextEvent.category]?.color, lineHeight: 1 }}>
                {String(new Date(nextEvent.date + 'T00:00:00').getDate()).padStart(2, '0')}
              </div>
              <div style={{ fontSize: '9px', textTransform: 'uppercase', color: CATEGORIES[nextEvent.category]?.color, opacity: 0.8 }}>
                {new Date(nextEvent.date + 'T00:00:00').toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: '800', fontSize: '15px', color: '#1a1a2e', marginBottom: '4px' }}>{nextEvent.title}</div>
              <div style={{ fontSize: '11px', color: '#6b5c85', marginBottom: '4px' }}>{nextEvent.time} · {nextEvent.location}</div>
              <CountdownBadge dateStr={nextEvent.date} />
            </div>
            {confirmed.includes(nextEvent.id)
              ? <CheckCircle2 size={26} color="#10b981" />
              : <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 2 }}><Circle size={26} color="#d1d5db" /></motion.div>
            }
          </div>
        </motion.div>
      )}

      {/* ── FILTERS + ADD ── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', alignItems: 'center' }}>
        <div style={{ display: 'flex', background: '#f3faf7', borderRadius: '12px', padding: '3px', flex: 1 }}>
          {[['all', 'Todos'], ['upcoming', 'Próximos'], ['past', 'Passados']].map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)} style={{ flex: 1, padding: '7px 4px', borderRadius: '9px', border: 'none', background: filter === id ? 'white' : 'transparent', color: filter === id ? '#059669' : '#6b7280', fontWeight: filter === id ? '700' : '500', fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: filter === id ? '0 1px 6px rgba(5,150,105,0.1)' : 'none' }}>
              {label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowModal(true)} style={{ background: '#059669', color: 'white', border: 'none', borderRadius: '12px', padding: '10px 14px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
          <Plus size={15} /> Evento
        </button>
      </div>

      {/* ── EVENT LIST ── */}
      <AnimatePresence mode="wait">
        <motion.div key={filter} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#aaa' }}>
              <Calendar size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <p style={{ fontSize: '14px' }}>Nenhum evento {filter === 'past' ? 'passado' : 'cadastrado'}.</p>
            </div>
          ) : (
            filtered.map(ev => (
              <EventCard key={ev.id} event={ev} confirmed={confirmed.includes(ev.id)}
                onToggleConfirm={toggleConfirm}
                onDelete={id => setEvents(es => es.filter(e => e.id !== id))}
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── ADD MODAL ── */}
      <AnimatePresence>
        {showModal && (
          <Modal title="Novo Evento" onClose={() => setShowModal(false)}>
            <Field label="Título *">
              <input style={inputStyle} placeholder="Nome do evento" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </Field>
            <Field label="Categoria">
              <select style={{ ...inputStyle, appearance: 'none' }} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
              </select>
            </Field>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Field label="Data *"><input type="date" style={inputStyle} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></Field>
              <Field label="Horário"><input style={inputStyle} placeholder="08:00 – 17:00" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} /></Field>
            </div>
            <Field label="Local">
              <input style={inputStyle} placeholder="Ex: Auditório Central – UFPE" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            </Field>
            <Field label="Andar / Referência">
              <input style={inputStyle} placeholder="Ex: Térreo, bloco A" value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} />
            </Field>
            <Field label="Como Chegar">
              <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} placeholder="Descreva como chegar ao local..." value={form.path} onChange={e => setForm(f => ({ ...f, path: e.target.value }))} />
            </Field>
            <Field label="Descrição">
              <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} placeholder="Detalhes do evento..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </Field>
            <Field label="Vagas (opcional)">
              <input type="number" style={inputStyle} placeholder="Ex: 50" value={form.vagas} onChange={e => setForm(f => ({ ...f, vagas: e.target.value }))} />
            </Field>
            <button onClick={addEvent} style={{ width: '100%', background: '#059669', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
              Adicionar Evento
            </button>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}
