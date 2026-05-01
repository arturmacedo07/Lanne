import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, ChevronDown, ChevronUp, Lightbulb, Calendar, Trash2, Check } from 'lucide-react'
import { useUserStorage } from '../hooks/useUserStorage'
import { createPortal } from 'react-dom'

/* ─── CONFIG ─────────────────────────────────── */
const FORMATS = {
  reels:     { label: 'Reels',     color: '#ec4899', bg: '#fdf2f8', emoji: '🎬' },
  carrossel: { label: 'Carrossel', color: '#8b5cf6', bg: '#f5f3ff', emoji: '🖼' },
  post:      { label: 'Post',      color: '#0ea5e9', bg: '#f0f9ff', emoji: '📷' },
  story:     { label: 'Story',     color: '#f59e0b', bg: '#fffbeb', emoji: '⚡' },
  podcast:   { label: 'Podcast',   color: '#10b981', bg: '#f0fdf4', emoji: '🎙' },
}

const PILLARS = {
  educativo:    { label: 'Educativo',    color: '#0ea5e9' },
  institucional:{ label: 'Institucional',color: '#8b5cf6' },
  bastidores:   { label: 'Bastidores',  color: '#f59e0b' },
  campanha:     { label: 'Campanha',    color: '#ef4444' },
  depoimento:   { label: 'Depoimento',  color: '#10b981' },
}

const STATUS = {
  ideia:    { label: 'Ideia',        color: '#94a3b8', bg: '#f8fafc', step: 0 },
  producao: { label: 'Em Produção',  color: '#f59e0b', bg: '#fffbeb', step: 1 },
  revisao:  { label: 'Revisão',      color: '#8b5cf6', bg: '#f5f3ff', step: 2 },
  agendado: { label: 'Agendado',     color: '#0ea5e9', bg: '#f0f9ff', step: 3 },
  publicado:{ label: 'Publicado ✓', color: '#10b981', bg: '#f0fdf4', step: 4 },
}

const MOCK_POSTS = [
  { id: 1, title: 'AVC: Reconheça os sinais — FAST', format: 'reels', pillar: 'educativo', status: 'agendado', date: '2026-05-08', responsavel: 'Ana', caption: 'Vídeo rápido de 30s mostrando os sinais de AVC com legenda. Chamar para compartilhar.', week: 19 },
  { id: 2, title: 'Bastidores do Plantão na Emergência', format: 'story', pillar: 'bastidores', status: 'producao', date: '2026-05-10', responsavel: 'Pedro', caption: 'Série de stories mostrando o dia a dia dos ligantes no plantão. Sem identificar pacientes.', week: 19 },
  { id: 3, title: 'Carrossel: Escala de Glasgow explicada', format: 'carrossel', pillar: 'educativo', status: 'revisao', date: '2026-05-14', responsavel: 'Ana', caption: '5 slides explicando os critérios da Glasgow de forma visual e didática.', week: 20 },
  { id: 4, title: 'Simpósio LANNE — Divulgação', format: 'post', pillar: 'institucional', status: 'publicado', date: '2026-04-28', responsavel: 'Beatriz', caption: 'Post de divulgação do Simpósio com data, local e link de inscrição na bio.', week: 18 },
]

const MOCK_IDEAS = [
  { id: 1, text: 'Entrevista com preceptor sobre casos de neurocirurgia', createdAt: '2026-04-30' },
  { id: 2, text: 'Meme educativo sobre reflexo patelar', createdAt: '2026-04-29' },
  { id: 3, text: 'Podcast: "Por que escolhi Neurologia?" com residentes', createdAt: '2026-04-28' },
]

/* ─── HELPERS ─────────────────────────────────── */
const inputStyle = { width: '100%', padding: '10px 13px', borderRadius: '11px', border: '1.5px solid #eee', fontSize: '13px', fontFamily: 'inherit', background: '#fafafa', boxSizing: 'border-box', outline: 'none' }

function Badge({ label, color, bg }) {
  return <span style={{ fontSize: '10px', fontWeight: '700', color, background: bg, padding: '2px 8px', borderRadius: '99px' }}>{label}</span>
}

function Field({ label, children, style }) {
  return (
    <div style={{ marginBottom: '12px', ...style }}>
      <label style={{ fontSize: '10px', fontWeight: '700', color: '#6b5c85', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '5px' }}>{label}</label>
      {children}
    </div>
  )
}

/* ─── MODAL ───────────────────────────────────── */
function Modal({ title, onClose, children }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [])

  const content = (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box', backdropFilter: 'blur(3px)' }}
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

  return createPortal(content, document.body)
}

/* ─── POST CARD ───────────────────────────────── */
function PostCard({ post, onDelete, onUpdate }) {
  const [open, setOpen] = useState(false)
  const s = STATUS[post.status] || STATUS.ideia
  const f = FORMATS[post.format] || FORMATS.post
  const p = PILLARS[post.pillar] || PILLARS.educativo

  const nextStatus = () => {
    const keys = Object.keys(STATUS)
    const idx = keys.indexOf(post.status)
    if (idx < keys.length - 1) onUpdate({ ...post, status: keys[idx + 1] })
  }

  return (
    <motion.div layout style={{ background: 'white', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 2px 14px rgba(75,44,127,0.08)', borderLeft: `4px solid ${s.color}`, marginBottom: '10px' }}>
      {/* Header */}
      <div onClick={() => setOpen(o => !o)} style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        {/* Format badge */}
        <div style={{ background: f.bg, borderRadius: '12px', padding: '8px 10px', textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: '18px', lineHeight: 1 }}>{f.emoji}</div>
          <div style={{ fontSize: '9px', color: f.color, fontWeight: '700', marginTop: '2px' }}>{f.label}</div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: '800', fontSize: '14px', color: '#1a1a2e', marginBottom: '5px', lineHeight: 1.3 }}>{post.title}</div>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '5px' }}>
            <Badge label={s.label} color={s.color} bg={s.bg} />
            <Badge label={p.label} color={p.color} bg={p.color + '15'} />
          </div>
          <div style={{ display: 'flex', gap: '10px', fontSize: '11px', color: '#6b5c85' }}>
            {post.date && <span>📅 {new Date(post.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>}
            {post.responsavel && <span>👤 {post.responsavel}</span>}
          </div>
        </div>

        <div style={{ color: '#ccc', flexShrink: 0 }}>{open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
      </div>

      {/* Expanded */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ borderTop: '1px solid #f5f5f5', padding: '14px 16px', display: 'grid', gap: '10px' }}>
              {/* Status pipeline */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                {Object.entries(STATUS).map(([key, val], i) => (
                  <React.Fragment key={key}>
                    <div style={{ fontSize: '10px', fontWeight: '700', padding: '4px 8px', borderRadius: '99px', background: post.status === key ? val.bg : '#f1f5f9', color: post.status === key ? val.color : '#94a3b8', cursor: 'pointer', border: post.status === key ? `1.5px solid ${val.color}` : '1.5px solid transparent', transition: 'all 0.15s' }} onClick={() => onUpdate({ ...post, status: key })}>
                      {val.label}
                    </div>
                    {i < Object.keys(STATUS).length - 1 && <span style={{ fontSize: '10px', color: '#d1d5db' }}>›</span>}
                  </React.Fragment>
                ))}
              </div>

              {post.caption && (
                <div style={{ background: '#fafafa', borderRadius: '10px', padding: '10px 12px', fontSize: '12px', color: '#4b5563', lineHeight: 1.6 }}>
                  <strong style={{ display: 'block', marginBottom: '4px', fontSize: '11px', color: '#2d1e42' }}>BRIEFING / LEGENDA</strong>
                  {post.caption}
                </div>
              )}

              {post.status !== 'publicado' && (
                <button onClick={nextStatus} style={{ background: '#f3f0ff', color: '#4b2c7f', border: 'none', borderRadius: '10px', padding: '9px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                  Avançar para "{STATUS[Object.keys(STATUS)[STATUS[post.status]?.step + 1]] ?.label}" →
                </button>
              )}

              <button onClick={() => onDelete(post.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', padding: 0 }}>
                <Trash2 size={13} /> Remover post
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── MAIN ────────────────────────────────────── */
const BLANK_POST = { title: '', format: 'post', pillar: 'educativo', status: 'ideia', date: '', responsavel: '', caption: '' }

export default function Marketing() {
  const [view, setView] = useState('cronograma')
  const [posts, setPosts] = useUserStorage('posts', MOCK_POSTS)
  const [ideas, setIdeas] = useUserStorage('ideas', MOCK_IDEAS)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(BLANK_POST)
  const [newIdea, setNewIdea] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const addPost = () => {
    if (!form.title) return
    setPosts(p => [...p, { ...form, id: Date.now(), week: 19 }])
    setForm(BLANK_POST)
    setShowModal(false)
  }

  const addIdea = () => {
    if (!newIdea.trim()) return
    setIdeas(i => [{ id: Date.now(), text: newIdea.trim(), createdAt: new Date().toISOString().split('T')[0] }, ...i])
    setNewIdea('')
  }

  const publishedCount = posts.filter(p => p.status === 'publicado').length
  const inProgressCount = posts.filter(p => ['producao', 'revisao', 'agendado'].includes(p.status)).length
  const filteredPosts = filterStatus === 'all' ? posts : posts.filter(p => p.status === filterStatus)
  const sorted = [...filteredPosts].sort((a, b) => new Date(a.date || '9999') - new Date(b.date || '9999'))

  return (
    <div className="animate-slide-up" style={{ paddingBottom: '8px' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #4c0082 0%, #7c3aed 50%, #ec4899 100%)', borderRadius: '22px', padding: '22px', marginBottom: '20px', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-25px', right: '-25px', width: '130px', height: '130px', background: 'rgba(255,255,255,0.07)', borderRadius: '50%' }} />
        <div style={{ fontSize: '11px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Comunicação & Conteúdo</div>
        <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '14px' }}>Central de Marketing</h2>
        <div style={{ display: 'flex', gap: '18px' }}>
          <div><div style={{ fontSize: '22px', fontWeight: '900' }}>{publishedCount}</div><div style={{ fontSize: '10px', opacity: 0.7 }}>Publicados</div></div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }} />
          <div><div style={{ fontSize: '22px', fontWeight: '900' }}>{inProgressCount}</div><div style={{ fontSize: '10px', opacity: 0.7 }}>Em andamento</div></div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }} />
          <div><div style={{ fontSize: '22px', fontWeight: '900' }}>{ideas.length}</div><div style={{ fontSize: '10px', opacity: 0.7 }}>Ideias</div></div>
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', background: '#f5f3ff', borderRadius: '14px', padding: '4px', marginBottom: '16px' }}>
        {[['cronograma', Calendar, 'Cronograma'], ['ideias', Lightbulb, 'Banco de Ideias']].map(([id, Icon, label]) => (
          <button key={id} onClick={() => setView(id)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: view === id ? 'white' : 'transparent', color: view === id ? '#7c3aed' : '#6b5c85', fontWeight: view === id ? '700' : '500', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', boxShadow: view === id ? '0 2px 8px rgba(124,58,237,0.12)' : 'none', transition: 'all 0.2s' }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {view === 'cronograma' ? (
          <motion.div key="cronograma" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {/* Status filter */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', overflowX: 'auto', paddingBottom: '4px' }}>
              <button onClick={() => setFilterStatus('all')} style={{ padding: '6px 12px', borderRadius: '99px', border: '1.5px solid', borderColor: filterStatus === 'all' ? '#7c3aed' : '#eee', background: filterStatus === 'all' ? '#f5f3ff' : 'white', color: filterStatus === 'all' ? '#7c3aed' : '#94a3b8', fontSize: '11px', fontWeight: '700', cursor: 'pointer', flexShrink: 0 }}>Todos</button>
              {Object.entries(STATUS).map(([key, val]) => (
                <button key={key} onClick={() => setFilterStatus(key)} style={{ padding: '6px 12px', borderRadius: '99px', border: '1.5px solid', borderColor: filterStatus === key ? val.color : '#eee', background: filterStatus === key ? val.bg : 'white', color: filterStatus === key ? val.color : '#94a3b8', fontSize: '11px', fontWeight: '700', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>{val.label}</button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#6b5c85', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{sorted.length} post{sorted.length !== 1 ? 's' : ''}</span>
              <button onClick={() => setShowModal(true)} style={{ background: '#7c3aed', color: 'white', border: 'none', borderRadius: '10px', padding: '8px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Plus size={14} /> Novo Post
              </button>
            </div>

            {sorted.map(post => (
              <PostCard key={post.id} post={post}
                onDelete={id => setPosts(ps => ps.filter(p => p.id !== id))}
                onUpdate={updated => setPosts(ps => ps.map(p => p.id === updated.id ? updated : p))}
              />
            ))}
            {sorted.length === 0 && <div style={{ textAlign: 'center', padding: '40px 20px', color: '#aaa', fontSize: '14px' }}>Nenhum post nesta categoria.</div>}
          </motion.div>
        ) : (
          <motion.div key="ideias" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {/* Quick add */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '14px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(124,58,237,0.08)' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#4b2c7f', marginBottom: '10px' }}>💡 Nova Ideia Rápida</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  value={newIdea}
                  onChange={e => setNewIdea(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addIdea()}
                  placeholder="Anote sua ideia de conteúdo..."
                  style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
                />
                <button onClick={addIdea} style={{ background: '#7c3aed', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 14px', cursor: 'pointer', flexShrink: 0 }}>
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '8px' }}>
              {ideas.map(idea => (
                <motion.div key={idea.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  style={{ background: 'white', borderRadius: '14px', padding: '13px 14px', boxShadow: '0 1px 10px rgba(124,58,237,0.06)', borderLeft: '4px solid #7c3aed', display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                  <Lightbulb size={16} color="#7c3aed" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a2e' }}>{idea.text}</div>
                    <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px' }}>{new Date(idea.createdAt).toLocaleDateString('pt-BR')}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      title="Criar post a partir desta ideia"
                      onClick={() => { setForm(f => ({ ...f, title: idea.text })); setView('cronograma'); setShowModal(true); setIdeas(is => is.filter(i => i.id !== idea.id)) }}
                      style={{ background: '#f5f3ff', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#7c3aed' }}
                    >
                      <Check size={14} />
                    </button>
                    <button onClick={() => setIdeas(is => is.filter(i => i.id !== idea.id))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
              {ideas.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#aaa' }}>
                  <Lightbulb size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                  <p style={{ fontSize: '14px' }}>Nenhuma ideia salva ainda.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Novo Post */}
      <AnimatePresence>
        {showModal && (
          <Modal title="Novo Post" onClose={() => setShowModal(false)}>
            <Field label="Título / Tema *">
              <input style={inputStyle} placeholder="Ex: AVC — reconheça os sinais" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </Field>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Field label="Formato" style={{ flex: 1 }}>
                <select style={{ ...inputStyle, appearance: 'none' }} value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))}>
                  {Object.entries(FORMATS).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
                </select>
              </Field>
              <Field label="Pilar" style={{ flex: 1 }}>
                <select style={{ ...inputStyle, appearance: 'none' }} value={form.pillar} onChange={e => setForm(f => ({ ...f, pillar: e.target.value }))}>
                  {Object.entries(PILLARS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Field label="Data planejada" style={{ flex: 1 }}>
                <input type="date" style={inputStyle} value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </Field>
              <Field label="Responsável" style={{ flex: 1 }}>
                <input style={inputStyle} placeholder="Ex: Ana" value={form.responsavel} onChange={e => setForm(f => ({ ...f, responsavel: e.target.value }))} />
              </Field>
            </div>
            <Field label="Status">
              <select style={{ ...inputStyle, appearance: 'none' }} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </Field>
            <Field label="Briefing / Legenda">
              <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} placeholder="Descreva o conteúdo, tom, CTA..." value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} />
            </Field>
            <button onClick={addPost} style={{ width: '100%', background: 'linear-gradient(135deg, #7c3aed, #ec4899)', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
              Adicionar ao Cronograma
            </button>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}
