import React, { createContext, useContext, useState } from 'react'

const UserContext = createContext(null)

const AVATAR_COLORS = ['#7c3aed','#0ea5e9','#10b981','#f59e0b','#ef4444','#ec4899','#8b5cf6','#14b8a6']

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const s = localStorage.getItem('lanne_active_user')
      if (!s || s === 'null' || s === 'undefined') return null
      return JSON.parse(s)
    } catch { return null }
  })

  const login = (user) => {
    localStorage.setItem('lanne_active_user', JSON.stringify(user))
    // Save user to global list
    const all = getStoredUsers()
    if (!all.find(u => u.id === user.id)) {
      localStorage.setItem('lanne_users', JSON.stringify([...all, user]))
    }
    setCurrentUser(user)
  }

  const logout = () => {
    localStorage.removeItem('lanne_active_user')
    setCurrentUser(null)
  }

  return (
    <UserContext.Provider value={{ currentUser, login, logout, AVATAR_COLORS }}>
      {children}
    </UserContext.Provider>
  )
}

export function getStoredUsers() {
  try {
    const s = localStorage.getItem('lanne_users')
    if (!s || s === 'null' || s === 'undefined') return []
    const parsed = JSON.parse(s)
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

export function createUser(name) {
  const colors = AVATAR_COLORS
  const id = name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now()
  const initials = name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  const color = colors[Math.floor(Math.random() * colors.length)]
  return { id, name: name.trim(), initials, color }
}

export const useUser = () => useContext(UserContext)
