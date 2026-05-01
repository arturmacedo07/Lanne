import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, ChevronDown, ChevronUp, BookOpen, FileText, Clock, User, Tag, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react'
import { useUserStorage } from '../hooks/useUserStorage'

/* ─── HELPERS ─────────────────────────────────────── */
const STATUS_CONFIG = {
  andamento:  { label: 'Em Andamento',  color: '#0ea5e9', bg: '#f0f9ff' },
  coleta:     { label: 'Coleta de Dados', color: '#f59e0b', bg: '#fffbeb' },
  analise:    { label: 'Análise',       color: '#8b5cf6', bg: '#f5f3ff' },
  escrita:    { label: 'Escrita',       color: '#10b981', bg: '#f0fdf4' },
  submetido:  { label: 'Submetido',     color: '#6366f1', bg: '#eef2ff' },
  pausado:    { label: 'Pausado',       color: '#94a3b8', bg: '#f8fafc' },
  concluido:  { label: 'Concluído',     color: '#10b981', bg: '#f0fdf4' },
}

const EDITAL_STATUS = {
  aberto:     { label: 'Aberto',         color: '#10b981', bg: '#f0fdf4' },
  inscrito:   { label: 'Inscrito',       color: '#0ea5e9', bg: '#f0f9ff' },
  aguardando: { label: 'Aguardando',     color: '#f59e0b', bg: '#fffbeb' },
  aprovado:   { label: 'Aprovado ✓',    color: '#10b981', bg: '#f0fdf4' },
  reprovado:  { label: 'Não aprovado',   color: '#ef4444', bg: '#fef2f2' },
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const diff = new Date(dateStr) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function DeadlineBadge({ dateStr }) {
  const days = daysUntil(dateStr)
  if (days === null) return null
  const color = days < 0 ? '#94a3b8' : days <= 3 ? '#ef4444' : days <= 7 ? '#f97316' : '#10b981'
  const label = days < 0 ? 'Encerrado' : days === 0 ? 'Hoje!' : `${days}d`
  return (
    <span style={{ fontSize: '10px', fontWeight: '800', color, background: color + '18', padding: '2px 7px', borderRadius: '99px' }}>
      {label}
    </span>
  )
}

function StatusBadge({ status, config }) {
  const s = config[status]
  if (!s) return null
  return (
    <span style={{ fontSize: '10px', fontWeight: '700', color: s.color, background: s.bg, padding: '2px 8px', borderRadius: '99px' }}>
      {s.label}
    </span>
  )
}

/* ─── MODAL ───────────────────────────────────────── */
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
        style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '360px', maxHeight: '75vh', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}
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

function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ fontSize: '11px', fontWeight: '700', color: '#6b5c85', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: '12px', border: '1.5px solid #eee', fontSize: '14px', fontFamily: 'inherit', outline: 'none', background: '#fafafa', boxSizing: 'border-box' }
const selectStyle = { ...inputStyle, appearance: 'none' }

/* ─── PROJECT CARD ─────────────────────────────── */
function ProjectCard({ project, onDelete, onUpdate }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(project)

  const s = STATUS_CONFIG[project.status] || STATUS_CONFIG.andamento
  const hasPrazo = !!project.prazo

  const saveEdit = () => {
    onUpdate(draft)
    setEditing(false)
  }
  const cancelEdit = (e) => {
    e.stopPropagation()
    setDraft(project)
    setEditing(false)
  }

  return (
    <motion.div layout style={{ background: 'white', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 2px 14px rgba(75,44,127,0.08)', borderLeft: `4px solid ${s.color}`, marginBottom: '12px' }}>
      {/* Header */}
      <div onClick={() => !editing && setOpen(o => !o)} style={{ padding: '16px', cursor: editing ? 'default' : 'pointer', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div style={{ background: s.bg, borderRadius: '10px', padding: '8px', flexShrink: 0 }}>
          <BookOpen size={18} color={s.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontWeight: '800', fontSize: '14px', color: '#1a1a2e', lineHeight: 1.3 }}>{project.title}</span>
            <StatusBadge status={project.status} config={STATUS_CONFIG} />
          </div>
          <div style={{ fontSize: '11px', color: '#6b5c85' }}>{project.area}</div>
          {project.orientador && (
            <div style={{ fontSize: '11px', color: '#6b5c85', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <User size={11} /> {project.orientador}
            </div>
          )}
          {hasPrazo && (
            <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={11} color="#6b5c85" />
              <DeadlineBadge dateStr={project.prazo} />
              <span style={{ fontSize: '10px', color: '#aaa' }}>{new Date(project.prazo).toLocaleDateString('pt-BR')}</span>
            </div>
          )}
        </div>
        <div style={{ color: '#ccc', flexShrink: 0 }}>{open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
      </div>

      {/* Expanded */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px 16px', borderTop: '1px solid #f5f5f5', display: 'grid', gap: '10px' }}>
              {!editing ? (
                <>
                  {project.objetivo && (
                    <div style={{ background: '#fafafa', borderRadius: '10px', padding: '10px 12px', fontSize: '12px', color: '#4b5563', lineHeight: 1.5 }}>
                      <strong style={{ display: 'block', marginBottom: '4px', color: '#2d1e42', fontSize: '11px' }}>OBJETIVO</strong>
                      {project.objetivo}
                    </div>
                  )}
                  {project.proximo && (
                    <div style={{ background: '#f3f0ff', borderRadius: '10px', padding: '10px 12px', fontSize: '12px', color: '#4b2c7f', lineHeight: 1.5 }}>
                      <strong style={{ display: 'block', marginBottom: '4px', fontSize: '11px' }}>📌 PRÓXIMO PASSO</strong>
                      {project.proximo}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => { setDraft(project); setEditing(true) }} style={{ flex: 1, background: '#f3f0ff', color: '#4b2c7f', border: 'none', borderRadius: '10px', padding: '9px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                      ✏️ Editar
                    </button>
                    <button onClick={() => onDelete(project.id)} style={{ background: 'none', border: '1.5px solid #fecaca', color: '#ef4444', borderRadius: '10px', padding: '9px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#6b5c85', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '5px' }}>Status</label>
                    <select value={draft.status} onChange={e => setDraft(d => ({ ...d, status: e.target.value }))} style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '13px', fontFamily: 'inherit', background: '#fafafa', boxSizing: 'border-box' }}>
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#6b5c85', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '5px' }}>Prazo do Projeto</label>
                    <input type="date" value={draft.prazo || ''} onChange={e => setDraft(d => ({ ...d, prazo: e.target.value }))} style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '13px', fontFamily: 'inherit', background: '#fafafa', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#6b5c85', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '5px' }}>Próximo Passo</label>
                    <input value={draft.proximo || ''} onChange={e => setDraft(d => ({ ...d, proximo: e.target.value }))} placeholder="Ex: Submeter abstract" style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '13px', fontFamily: 'inherit', background: '#fafafa', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', fontWeight: '700', color: '#6b5c85', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '5px' }}>Orientador</label>
                    <input value={draft.orientador || ''} onChange={e => setDraft(d => ({ ...d, orientador: e.target.value }))} placeholder="Nome do orientador" style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '13px', fontFamily: 'inherit', background: '#fafafa', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={saveEdit} style={{ flex: 1, background: '#4b2c7f', color: 'white', border: 'none', borderRadius: '10px', padding: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>Salvar</button>
                    <button onClick={cancelEdit} style={{ flex: 1, background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '10px', padding: '10px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}


/* ─── EDITAL CARD ─────────────────────────────────── */
function EditalCard({ edital, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(edital)
  const s = EDITAL_STATUS[edital.status] || EDITAL_STATUS.aberto
  const days = daysUntil(edital.prazo)
  const urgent = days !== null && days >= 0 && days <= 5
  const save = () => { onUpdate(draft); setEditing(false) }

  return (
    <motion.div layout style={{ background: 'white', borderRadius: '16px', padding: '14px 16px', boxShadow: '0 2px 14px rgba(75,44,127,0.07)', borderLeft: `4px solid ${urgent ? '#ef4444' : s.color}`, marginBottom: '10px' }}>
      {!editing ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
            <span style={{ fontWeight: '800', fontSize: '13px', color: '#1a1a2e', flex: 1, paddingRight: '8px', lineHeight: 1.3 }}>{edital.title}</span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
              {edital.prazo && <DeadlineBadge dateStr={edital.prazo} />}
              <StatusBadge status={edital.status} config={EDITAL_STATUS} />
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '11px', color: '#6b5c85', marginBottom: '10px' }}>
            {edital.instituicao && <span>🏛 {edital.instituicao}</span>}
            {edital.area && <span><Tag size={11} style={{ display: 'inline' }} /> {edital.area}</span>}
            {edital.prazo && <span><Clock size={11} style={{ display: 'inline' }} /> {new Date(edital.prazo).toLocaleDateString('pt-BR')}</span>}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select value={edital.status} onChange={e => onUpdate({ ...edital, status: e.target.value })} style={{ flex: 1, padding: '7px 10px', borderRadius: '8px', border: '1.5px solid #eee', fontSize: '11px', fontFamily: 'inherit', background: '#fafafa', color: '#4b2c7f', fontWeight: '600' }}>
              {Object.entries(EDITAL_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <button onClick={() => { setDraft(edital); setEditing(true) }} style={{ background: '#f3f0ff', color: '#4b2c7f', border: 'none', borderRadius: '8px', padding: '7px 12px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>✏️ Editar</button>
            <button onClick={() => onDelete(edital.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} /></button>
          </div>
        </>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          <div>
            <label style={{ fontSize: '10px', fontWeight: '700', color: '#6b5c85', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '5px' }}>Título</label>
            <input value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '13px', fontFamily: 'inherit', background: '#fafafa', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '10px', fontWeight: '700', color: '#6b5c85', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '5px' }}>Instituição</label>
            <input value={draft.instituicao || ''} onChange={e => setDraft(d => ({ ...d, instituicao: e.target.value }))} style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '13px', fontFamily: 'inherit', background: '#fafafa', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '10px', fontWeight: '700', color: '#6b5c85', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '5px' }}>Prazo</label>
              <input type="date" value={draft.prazo || ''} onChange={e => setDraft(d => ({ ...d, prazo: e.target.value }))} style={{ width: '100%', padding: '9px 10px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '12px', fontFamily: 'inherit', background: '#fafafa', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '10px', fontWeight: '700', color: '#6b5c85', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '5px' }}>Status</label>
              <select value={draft.status} onChange={e => setDraft(d => ({ ...d, status: e.target.value }))} style={{ width: '100%', padding: '9px 10px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '12px', fontFamily: 'inherit', background: '#fafafa', color: '#4b2c7f', fontWeight: '600', boxSizing: 'border-box' }}>
                {Object.entries(EDITAL_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={save} style={{ flex: 1, background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '10px', padding: '10px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>Salvar</button>
            <button onClick={() => { setDraft(edital); setEditing(false) }} style={{ flex: 1, background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: '10px', padding: '10px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
          </div>
        </div>
      )}
    </motion.div>
  )
}


/* ─── MAIN ────────────────────────────────────────── */
const MOCK_PROJECTS = [
  { id: 1, title: 'Epidemiologia do AVC Isquêmico no Nordeste', area: 'Neurologia Vascular', status: 'coleta', orientador: 'Dr. Eduardo', objetivo: 'Analisar incidência e fatores de risco do AVC isquêmico em população do Nordeste brasileiro.', proximo: 'Coletar dados dos últimos 50 prontuários do HC.' },
  { id: 2, title: 'Uso de rTPA em Hospital Público', area: 'AVC / Neurologia de Urgência', status: 'escrita', orientador: 'Dra. Luciana', objetivo: 'Avaliar taxa de trombolíticos e outcomes no Hospital da Restauração.', proximo: 'Finalizar discussão e submeter para RBNE.' },
]
const MOCK_EDITAIS = [
  { id: 1, title: 'Bolsa IC FACEPE 2026', instituicao: 'FACEPE', area: 'Neurociências', prazo: '2026-05-10', status: 'inscrito' },
  { id: 2, title: 'Congresso SBN – Abstract', instituicao: 'SBN', area: 'Neurocirurgia', prazo: '2026-06-01', status: 'aberto' },
]

export default function Pesquisa() {
  const [view, setView] = useState('projetos')
  const [projects, setProjects] = useUserStorage('projects_v2', MOCK_PROJECTS)
  const [editais, setEditais] = useUserStorage('editais', MOCK_EDITAIS)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showEditalModal, setShowEditalModal] = useState(false)
  const [projectForm, setProjectForm] = useState({ title: '', area: '', orientador: '', status: 'andamento', objetivo: '', proximo: '' })
  const [editalForm, setEditalForm] = useState({ title: '', instituicao: '', area: '', prazo: '', status: 'aberto' })

  const addProject = () => {
    if (!projectForm.title) return
    setProjects(p => [...p, { ...projectForm, id: Date.now() }])
    setProjectForm({ title: '', area: '', orientador: '', status: 'andamento', objetivo: '', proximo: '' })
    setShowProjectModal(false)
  }
  const addEdital = () => {
    if (!editalForm.title) return
    setEditais(e => [...e, { ...editalForm, id: Date.now() }])
    setEditalForm({ title: '', instituicao: '', area: '', prazo: '', status: 'aberto' })
    setShowEditalModal(false)
  }

  const activeProjects = projects.filter(p => p.status !== 'concluido' && p.status !== 'pausado')
  const openEditais = editais.filter(e => e.status === 'aberto' || e.status === 'inscrito' || e.status === 'aguardando')

  return (
    <div className="animate-slide-up" style={{ paddingBottom: '8px' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #0ea5e9)', borderRadius: '20px', padding: '20px', marginBottom: '20px', color: 'white' }}>
        <div style={{ fontSize: '11px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Pesquisa Científica</div>
        <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '14px' }}>Meu Painel de Pesquisa</h2>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div><div style={{ fontSize: '22px', fontWeight: '900' }}>{activeProjects.length}</div><div style={{ fontSize: '10px', opacity: 0.7 }}>Projetos ativos</div></div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }} />
          <div><div style={{ fontSize: '22px', fontWeight: '900' }}>{openEditais.length}</div><div style={{ fontSize: '10px', opacity: 0.7 }}>Editais em aberto</div></div>
          <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)' }} />
          <div><div style={{ fontSize: '22px', fontWeight: '900' }}>{projects.filter(p => p.status === 'concluido').length}</div><div style={{ fontSize: '10px', opacity: 0.7 }}>Concluídos</div></div>
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', background: '#f3f0ff', borderRadius: '14px', padding: '4px', marginBottom: '16px' }}>
        {[['projetos', BookOpen, 'Projetos'], ['editais', FileText, 'Editais & Bolsas']].map(([id, Icon, label]) => (
          <button key={id} onClick={() => setView(id)} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: view === id ? 'white' : 'transparent', color: view === id ? '#4b2c7f' : '#6b5c85', fontWeight: view === id ? '700' : '500', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', boxShadow: view === id ? '0 2px 8px rgba(75,44,127,0.12)' : 'none', transition: 'all 0.2s' }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {view === 'projetos' ? (
          <motion.div key="projetos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#6b5c85', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{projects.length} projeto{projects.length !== 1 ? 's' : ''}</span>
              <button onClick={() => setShowProjectModal(true)} style={{ background: '#4b2c7f', color: 'white', border: 'none', borderRadius: '10px', padding: '8px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={14} /> Novo Projeto
              </button>
            </div>
            {projects.map(p => <ProjectCard key={p.id} project={p} onDelete={id => setProjects(ps => ps.filter(p => p.id !== id))} onUpdate={updated => setProjects(ps => ps.map(p => p.id === updated.id ? updated : p))} />)}
            {projects.length === 0 && <div style={{ textAlign: 'center', padding: '40px 20px', color: '#aaa', fontSize: '14px' }}>Nenhum projeto cadastrado.</div>}
          </motion.div>
        ) : (
          <motion.div key="editais" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#6b5c85', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{editais.length} edital{editais.length !== 1 ? 'is' : ''}</span>
              <button onClick={() => setShowEditalModal(true)} style={{ background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '10px', padding: '8px 14px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={14} /> Novo Edital
              </button>
            </div>
            {editais.map(e => (
              <EditalCard key={e.id} edital={e}
                onDelete={id => setEditais(es => es.filter(e => e.id !== id))}
                onUpdate={updated => setEditais(es => es.map(e => e.id === updated.id ? updated : e))}
              />
            ))}
            {editais.length === 0 && <div style={{ textAlign: 'center', padding: '40px 20px', color: '#aaa', fontSize: '14px' }}>Nenhum edital cadastrado.</div>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showProjectModal && (
          <Modal title="Novo Projeto" onClose={() => setShowProjectModal(false)}>
            <FormField label="Título *">
              <input style={inputStyle} placeholder="Nome do projeto" value={projectForm.title} onChange={e => setProjectForm(f => ({ ...f, title: e.target.value }))} />
            </FormField>
            <FormField label="Área de Pesquisa">
              <input style={inputStyle} placeholder="Ex: Neurologia Vascular" value={projectForm.area} onChange={e => setProjectForm(f => ({ ...f, area: e.target.value }))} />
            </FormField>
            <FormField label="Orientador">
              <input style={inputStyle} placeholder="Nome do orientador" value={projectForm.orientador} onChange={e => setProjectForm(f => ({ ...f, orientador: e.target.value }))} />
            </FormField>
            <FormField label="Status">
              <select style={selectStyle} value={projectForm.status} onChange={e => setProjectForm(f => ({ ...f, status: e.target.value }))}>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </FormField>
            <FormField label="Objetivo">
              <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} placeholder="Descreva brevemente o objetivo..." value={projectForm.objetivo} onChange={e => setProjectForm(f => ({ ...f, objetivo: e.target.value }))} />
            </FormField>
            <FormField label="Próximo Passo">
              <input style={inputStyle} placeholder="Ex: Submeter abstract para o SBN" value={projectForm.proximo} onChange={e => setProjectForm(f => ({ ...f, proximo: e.target.value }))} />
            </FormField>
            <button onClick={addProject} style={{ width: '100%', background: '#4b2c7f', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', marginTop: '4px' }}>
              Adicionar Projeto
            </button>
          </Modal>
        )}
        {showEditalModal && (
          <Modal title="Novo Edital / Bolsa" onClose={() => setShowEditalModal(false)}>
            <FormField label="Título *">
              <input style={inputStyle} placeholder="Ex: Bolsa IC FAPESP 2026" value={editalForm.title} onChange={e => setEditalForm(f => ({ ...f, title: e.target.value }))} />
            </FormField>
            <FormField label="Instituição">
              <input style={inputStyle} placeholder="Ex: FACEPE, SBN, CNPq" value={editalForm.instituicao} onChange={e => setEditalForm(f => ({ ...f, instituicao: e.target.value }))} />
            </FormField>
            <FormField label="Área">
              <input style={inputStyle} placeholder="Ex: Neurociências" value={editalForm.area} onChange={e => setEditalForm(f => ({ ...f, area: e.target.value }))} />
            </FormField>
            <FormField label="Prazo de Inscrição">
              <input type="date" style={inputStyle} value={editalForm.prazo} onChange={e => setEditalForm(f => ({ ...f, prazo: e.target.value }))} />
            </FormField>
            <FormField label="Status">
              <select style={selectStyle} value={editalForm.status} onChange={e => setEditalForm(f => ({ ...f, status: e.target.value }))}>
                {Object.entries(EDITAL_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </FormField>
            <button onClick={addEdital} style={{ width: '100%', background: '#0ea5e9', color: 'white', border: 'none', borderRadius: '12px', padding: '14px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', marginTop: '4px' }}>
              Adicionar Edital
            </button>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}
