import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser, getStoredUsers, createUser } from '../context/UserContext'
import { Plus, User, ArrowRight, LogIn } from 'lucide-react'

export default function LoginScreen() {
  const { login, AVATAR_COLORS } = useUser()
  const [users, setUsers] = useState(getStoredUsers())
  const [showNewForm, setShowNewForm] = useState(false)
  const [newName, setNewName] = useState('')

  const handleCreate = () => {
    if (!newName.trim()) return
    const user = createUser(newName)
    login(user)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)',
      display: 'flex',
      flexDirection: 'column',
      padding: '40px 24px'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: '40px' }}
      >
        <img 
          src="/logo.png" 
          alt="LANNE Logo" 
          style={{ width: '80px', height: '80px', marginBottom: '16px' }} 
        />
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#1a1a2e', marginBottom: '8px' }}>LANNE</h1>
        <p style={{ fontSize: '14px', color: '#6b5c85' }}>Selecione seu perfil para acessar o painel</p>
      </motion.div>

      <div style={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          {!showNewForm ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {users.map((user) => (
                  <motion.button
                    key={user.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => login(user)}
                    style={{
                      background: 'white',
                      border: 'none',
                      borderRadius: '24px',
                      padding: '24px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px',
                      boxShadow: '0 4px 15px rgba(75,44,127,0.06)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ 
                      width: '56px', 
                      height: '56px', 
                      borderRadius: '20px', 
                      background: user.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '20px',
                      fontWeight: '800'
                    }}>
                      {user.initials}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a2e' }}>{user.name}</span>
                  </motion.button>
                ))}

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNewForm(true)}
                  style={{
                    background: 'rgba(75,44,127,0.03)',
                    border: '2px dashed rgba(75,44,127,0.1)',
                    borderRadius: '24px',
                    padding: '24px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ 
                    width: '56px', 
                    height: '56px', 
                    borderRadius: '20px', 
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#4b2c7f'
                  }}>
                    <Plus size={24} />
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#4b2c7f' }}>Novo Perfil</span>
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{ background: 'white', borderRadius: '32px', padding: '32px 24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
            >
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#1a1a2e', marginBottom: '24px' }}>Criar Perfil</h2>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#6b5c85', display: 'block', marginBottom: '8px' }}>SEU NOME</label>
                <input 
                  autoFocus
                  placeholder="Ex: Dr. Eduardo"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '16px',
                    border: '2px solid #f0f0f0',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setShowNewForm(false)}
                  style={{ flex: 1, padding: '16px', borderRadius: '16px', border: 'none', background: '#f3f4f6', color: '#4b5563', fontWeight: '700', cursor: 'pointer' }}
                >
                  Voltar
                </button>
                <button 
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  style={{ 
                    flex: 2, 
                    padding: '16px', 
                    borderRadius: '16px', 
                    border: 'none', 
                    background: 'linear-gradient(135deg, #4b2c7f 0%, #7c3aed 100%)', 
                    color: 'white', 
                    fontWeight: '700', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px',
                    cursor: 'pointer',
                    opacity: newName.trim() ? 1 : 0.6
                  }}
                >
                  Acessar <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ textAlign: 'center', marginTop: 'auto', paddingTop: '20px' }}>
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>Os dados são salvos apenas neste dispositivo (Offline)</p>
      </div>
    </div>
  )
}
