import React from 'react'
import { BookOpen, Search, Calendar, Share2, LayoutDashboard } from 'lucide-react'

const Navbar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'gestao', label: 'Gestão', icon: LayoutDashboard },
    { id: 'ensino', label: 'Ensino', icon: BookOpen },
    { id: 'pesquisa', label: 'Pesquisa', icon: Search },
    { id: 'extensao', label: 'Extensão', icon: Calendar },
    { id: 'marketing', label: 'Marketing', icon: Share2 },
  ]

  return (
    <nav className="glass" style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      right: '20px',
      height: '70px',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '0 10px',
      zIndex: 1000
    }}>
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              flex: 1
            }}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span style={{ fontSize: '10px', fontWeight: isActive ? '700' : '500' }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

export default Navbar
