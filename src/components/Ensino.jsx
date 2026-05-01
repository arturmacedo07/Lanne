import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, RotateCcw, Info } from 'lucide-react'

/* ─── SCALES DATA ─────────────────────────────────── */
const SCALES = [
  {
    id: 'gcs',
    name: 'Glasgow Coma Scale',
    abbr: 'GCS',
    color: '#7c3aed',
    bg: '#f3f0ff',
    range: [3, 15],
    description: 'Avalia nível de consciência após trauma ou outras causas.',
    interpret: score => score >= 13 ? { label: 'Leve', color: '#10b981', bg: '#f0fdf4' } : score >= 9 ? { label: 'Moderado', color: '#f59e0b', bg: '#fffbeb' } : { label: 'Grave (Coma)', color: '#ef4444', bg: '#fef2f2' },
    categories: [
      {
        id: 'eye', name: 'Abertura Ocular', maxScore: 4,
        items: [
          { score: 4, label: 'Espontânea' },
          { score: 3, label: 'À voz' },
          { score: 2, label: 'À dor' },
          { score: 1, label: 'Ausente' },
        ]
      },
      {
        id: 'verbal', name: 'Resposta Verbal', maxScore: 5,
        items: [
          { score: 5, label: 'Orientado' },
          { score: 4, label: 'Confuso' },
          { score: 3, label: 'Palavras inapropriadas' },
          { score: 2, label: 'Sons incompreensíveis' },
          { score: 1, label: 'Ausente' },
        ]
      },
      {
        id: 'motor', name: 'Resposta Motora', maxScore: 6,
        items: [
          { score: 6, label: 'Obedece comandos' },
          { score: 5, label: 'Localiza a dor' },
          { score: 4, label: 'Retirada à dor' },
          { score: 3, label: 'Flexão anormal (Decorticação)' },
          { score: 2, label: 'Extensão anormal (Decerebração)' },
          { score: 1, label: 'Ausente' },
        ]
      }
    ]
  },
  {
    id: 'nihss',
    name: 'NIH Stroke Scale',
    abbr: 'NIHSS',
    color: '#0ea5e9',
    bg: '#f0f9ff',
    range: [0, 42],
    description: 'Quantifica déficit neurológico em pacientes com AVC agudo.',
    interpret: score => score === 0 ? { label: 'Normal', color: '#10b981', bg: '#f0fdf4' } : score <= 4 ? { label: 'Leve', color: '#84cc16', bg: '#f7fee7' } : score <= 15 ? { label: 'Moderado', color: '#f59e0b', bg: '#fffbeb' } : score <= 20 ? { label: 'Grave', color: '#f97316', bg: '#fff7ed' } : { label: 'Muito Grave', color: '#ef4444', bg: '#fef2f2' },
    categories: [
      {
        id: 'consciousness', name: '1a. Nível de Consciência', maxScore: 3,
        items: [{ score: 0, label: 'Alerta' }, { score: 1, label: 'Sonolento' }, { score: 2, label: 'Estupor' }, { score: 3, label: 'Coma' }]
      },
      {
        id: 'loc_questions', name: '1b. Perguntas (mês/idade)', maxScore: 2,
        items: [{ score: 0, label: 'Ambas corretas' }, { score: 1, label: 'Uma correta' }, { score: 2, label: 'Nenhuma correta' }]
      },
      {
        id: 'loc_commands', name: '1c. Comandos (olhos/mão)', maxScore: 2,
        items: [{ score: 0, label: 'Ambos corretos' }, { score: 1, label: 'Um correto' }, { score: 2, label: 'Nenhum correto' }]
      },
      {
        id: 'gaze', name: '2. Olhar Conjugado', maxScore: 2,
        items: [{ score: 0, label: 'Normal' }, { score: 1, label: 'Paresia parcial' }, { score: 2, label: 'Desvio forçado' }]
      },
      {
        id: 'visual', name: '3. Campos Visuais', maxScore: 3,
        items: [{ score: 0, label: 'Sem perda' }, { score: 1, label: 'Hemianopsia parcial' }, { score: 2, label: 'Hemianopsia completa' }, { score: 3, label: 'Cegueira bilateral' }]
      },
      {
        id: 'facial', name: '4. Paralisia Facial', maxScore: 3,
        items: [{ score: 0, label: 'Normal' }, { score: 1, label: 'Leve' }, { score: 2, label: 'Parcial' }, { score: 3, label: 'Completa' }]
      },
      {
        id: 'arm', name: '5. Motor Braço (pior lado)', maxScore: 4,
        items: [{ score: 0, label: 'Sem queda' }, { score: 1, label: 'Queda antes de 10s' }, { score: 2, label: 'Esforço contra gravidade' }, { score: 3, label: 'Sem esforço contra gravidade' }, { score: 4, label: 'Sem movimento' }]
      },
      {
        id: 'leg', name: '6. Motor Perna (pior lado)', maxScore: 4,
        items: [{ score: 0, label: 'Sem queda' }, { score: 1, label: 'Queda antes de 5s' }, { score: 2, label: 'Esforço contra gravidade' }, { score: 3, label: 'Sem esforço contra gravidade' }, { score: 4, label: 'Sem movimento' }]
      },
      {
        id: 'ataxia', name: '7. Ataxia de Membros', maxScore: 2,
        items: [{ score: 0, label: 'Ausente' }, { score: 1, label: 'Em 1 membro' }, { score: 2, label: 'Em 2 membros' }]
      },
      {
        id: 'sensory', name: '8. Sensibilidade', maxScore: 2,
        items: [{ score: 0, label: 'Normal' }, { score: 1, label: 'Leve perda' }, { score: 2, label: 'Perda grave' }]
      },
      {
        id: 'language', name: '9. Linguagem / Afasia', maxScore: 3,
        items: [{ score: 0, label: 'Normal' }, { score: 1, label: 'Afasia leve' }, { score: 2, label: 'Afasia grave' }, { score: 3, label: 'Mudo / Afasia global' }]
      },
      {
        id: 'dysarthria', name: '10. Disartria', maxScore: 2,
        items: [{ score: 0, label: 'Normal' }, { score: 1, label: 'Leve' }, { score: 2, label: 'Ininteligível' }]
      },
      {
        id: 'extinction', name: '11. Extinção / Negligência', maxScore: 2,
        items: [{ score: 0, label: 'Normal' }, { score: 1, label: 'Perda em uma modalidade' }, { score: 2, label: 'Perda em mais de uma' }]
      }
    ]
  },
  {
    id: 'mrs',
    name: 'Escala de Rankin Modificada',
    abbr: 'mRS',
    color: '#10b981',
    bg: '#f0fdf4',
    range: [0, 6],
    description: 'Avalia grau de incapacidade funcional e dependência após AVC.',
    interpret: score => score === 0 ? { label: 'Sem sintomas', color: '#10b981', bg: '#f0fdf4' } : score <= 1 ? { label: 'Sem incapacidade significativa', color: '#84cc16', bg: '#f7fee7' } : score <= 2 ? { label: 'Incapacidade leve', color: '#eab308', bg: '#fefce8' } : score <= 3 ? { label: 'Incapacidade moderada', color: '#f59e0b', bg: '#fffbeb' } : score <= 4 ? { label: 'Incapacidade grave', color: '#f97316', bg: '#fff7ed' } : score === 5 ? { label: 'Incapacidade muito grave', color: '#ef4444', bg: '#fef2f2' } : { label: 'Óbito', color: '#1f2937', bg: '#f9fafb' },
    categories: [
      {
        id: 'rankin', name: 'Grau de Dependência', maxScore: 6,
        items: [
          { score: 0, label: '0 – Assintomático' },
          { score: 1, label: '1 – Sintomas sem incapacidade' },
          { score: 2, label: '2 – Incapacidade leve (independente)' },
          { score: 3, label: '3 – Incapacidade moderada (auxílio)' },
          { score: 4, label: '4 – Incapacidade grave (dependente)' },
          { score: 5, label: '5 – Incapacidade muito grave (acamado)' },
          { score: 6, label: '6 – Óbito' },
        ]
      }
    ]
  }
]

/* ─── SCALE CALCULATOR ────────────────────────────── */
function ScaleCard({ scale }) {
  const [open, setOpen] = useState(false)
  const [selections, setSelections] = useState({}) // { categoryId: score }

  const filledCategories = Object.keys(selections).length
  const totalCategories = scale.categories.length
  const totalScore = Object.values(selections).reduce((a, b) => a + b, 0)
  const allFilled = filledCategories === totalCategories

  const interpretation = allFilled || filledCategories > 0 ? scale.interpret(totalScore) : null

  const handleSelect = (catId, score) => {
    setSelections(prev => {
      if (prev[catId] === score) {
        const newSelections = { ...prev }
        delete newSelections[catId]
        return newSelections
      }
      return { ...prev, [catId]: score }
    })
  }

  const reset = (e) => {
    e.stopPropagation()
    setSelections({})
  }

  const progressPct = totalCategories > 0 ? Math.round((filledCategories / totalCategories) * 100) : 0

  return (
    <motion.div layout style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 16px rgba(75,44,127,0.08)', marginBottom: '12px' }}>
      {/* Header */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{ padding: '18px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
      >
        {/* Score badge */}
        <div style={{
          width: '56px', height: '56px', borderRadius: '16px',
          background: interpretation ? interpretation.bg : scale.bg,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'background 0.3s'
        }}>
          <span style={{ fontSize: '20px', fontWeight: '900', color: interpretation ? interpretation.color : scale.color, lineHeight: 1 }}>
            {filledCategories > 0 ? totalScore : '—'}
          </span>
          <span style={{ fontSize: '8px', color: interpretation ? interpretation.color : scale.color, opacity: 0.7, textTransform: 'uppercase' }}>pts</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontWeight: '800', fontSize: '15px', color: '#1a1a2e' }}>{scale.name}</span>
            <span style={{ fontSize: '10px', fontWeight: '700', background: scale.bg, color: scale.color, padding: '2px 7px', borderRadius: '20px' }}>{scale.abbr}</span>
          </div>
          <p style={{ fontSize: '11px', color: '#6b5c85', marginBottom: '8px', lineHeight: 1.4 }}>{scale.description}</p>
          {/* Mini progress bar */}
          <div style={{ height: '4px', background: '#f0ebf8', borderRadius: '99px', overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4 }}
              style={{ height: '100%', background: allFilled ? '#10b981' : scale.color, borderRadius: '99px' }}
            />
          </div>
          <div style={{ fontSize: '10px', color: '#aaa', marginTop: '4px' }}>
            {filledCategories}/{totalCategories} itens avaliados
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          {filledCategories > 0 && (
            <button onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', padding: '2px' }}>
              <RotateCcw size={14} />
            </button>
          )}
          <div style={{ color: '#ccc' }}>
            {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>

      {/* Interpretation pill */}
      <AnimatePresence>
        {interpretation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ margin: '0 18px 12px', padding: '8px 14px', background: interpretation.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>{allFilled ? '✅' : '📊'}</span>
              <div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: interpretation.color }}>{interpretation.label}</span>
                {!allFilled && <span style={{ fontSize: '11px', color: '#aaa', marginLeft: '6px' }}>— avaliação parcial</span>}
              </div>
              <div style={{ marginLeft: 'auto', fontSize: '18px', fontWeight: '900', color: interpretation.color }}>{totalScore}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded categories */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: '1px solid #f5f5f5', padding: '16px 18px', display: 'grid', gap: '16px' }}>
              {scale.categories.map(cat => (
                <div key={cat.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#2d1e42' }}>{cat.name}</span>
                    {selections[cat.id] !== undefined && (
                      <span style={{ fontSize: '11px', fontWeight: '800', background: scale.bg, color: scale.color, padding: '2px 8px', borderRadius: '99px' }}>
                        {selections[cat.id]} pt{selections[cat.id] !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'grid', gap: '6px' }}>
                    {cat.items.map(item => {
                      const selected = selections[cat.id] === item.score
                      return (
                        <motion.button
                          key={item.score}
                          onClick={() => handleSelect(cat.id, item.score)}
                          whileTap={{ scale: 0.97 }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '10px 12px',
                            borderRadius: '10px',
                            border: `1.5px solid ${selected ? scale.color : '#eee'}`,
                            background: selected ? scale.bg : '#fafafa',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            transition: 'all 0.15s'
                          }}
                        >
                          <div style={{
                            width: '22px', height: '22px', borderRadius: '50%',
                            border: `2px solid ${selected ? scale.color : '#ddd'}`,
                            background: selected ? scale.color : 'white',
                            flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {selected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                          </div>
                          <span style={{ fontSize: '12px', color: selected ? scale.color : '#4b5563', fontWeight: selected ? '700' : '500', flex: 1 }}>
                            {item.label}
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: selected ? scale.color : '#aaa' }}>
                            {item.score}
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── MAIN ────────────────────────────────────────── */
export default function Ensino() {
  return (
    <div className="animate-slide-up" style={{ paddingBottom: '8px' }}>
      {/* Header info */}
      <div style={{ background: 'linear-gradient(135deg, #3b1f6e, #7c3aed)', borderRadius: '20px', padding: '20px', marginBottom: '20px', color: 'white' }}>
        <div style={{ fontSize: '11px', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>Neurological Toolkit</div>
        <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '6px' }}>Calculadoras Clínicas</h2>
        <p style={{ fontSize: '12px', opacity: 0.8, lineHeight: 1.5 }}>Selecione os achados clínicos em cada escala. A pontuação é calculada automaticamente.</p>
      </div>

      {SCALES.map(scale => <ScaleCard key={scale.id} scale={scale} />)}
    </div>
  )
}
