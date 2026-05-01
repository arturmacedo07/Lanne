import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import Ensino from './components/Ensino'
import Pesquisa from './components/Pesquisa'
import Extensao from './components/Extensao'
import Marketing from './components/Marketing'
import LoginScreen from './components/LoginScreen'
import { UserProvider, useUser } from './context/UserContext'
import { LogOut } from 'lucide-react'
import './index.css'

function AppContent() {
  const { currentUser, logout } = useUser()
  const [activeTab, setActiveTab] = useState('gestao')

  if (!currentUser) return <LoginScreen />

  const renderContent = () => {
    switch (activeTab) {
      case 'ensino': return <Ensino key={currentUser?.id} />
      case 'pesquisa': return <Pesquisa key={currentUser?.id} />
      case 'extensao': return <Extensao key={currentUser?.id} />
      case 'marketing': return <Marketing key={currentUser?.id} />
      case 'gestao': return <Dashboard key={currentUser?.id} />
      default: return <Dashboard key={currentUser?.id} />
    }
  }

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'ensino': return 'Neurological Toolkit'
      case 'pesquisa': return 'Meus Projetos'
      case 'extensao': return 'Agenda de Extensão'
      case 'marketing': return 'Marketing & Mídias'
      case 'gestao': return 'Gestão Acadêmica'
      default: return 'LANNE'
    }
  }

  return (
    <div className="app-container">
      <header style={{ 
        padding: '20px 20px 15px', 
        textAlign: 'left',
        background: 'white',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/Logo_Nova.png" alt="LANNE Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          <div>
            <h1 style={{ color: 'var(--primary)', fontSize: '18px', fontWeight: '800', lineHeight: 1.2 }}>{getHeaderTitle()}</h1>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>LANNE: Liga Acadêmica de Neurologia e Neurocirurgia</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div onClick={logout} style={{ textAlign: 'right', cursor: 'pointer' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#1a1a2e' }}>{currentUser.name}</div>
            <div style={{ fontSize: '9px', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
              Sair <LogOut size={8} />
            </div>
          </div>
          <div style={{ 
            width: '38px', 
            height: '38px', 
            borderRadius: '12px', 
            background: currentUser.color,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: '800',
            boxShadow: `0 4px 10px ${currentUser.color}44`
          }}>
            {currentUser.initials}
          </div>
        </div>
      </header>
      
      <main style={{ padding: '20px' }}>
        {renderContent()}
      </main>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  )
}

export default App
