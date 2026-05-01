import { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext'

export function useUserStorage(key, initialValue) {
  const { currentUser } = useUser()
  
  // Create a user-specific key
  const storageKey = currentUser ? `lanne_${currentUser.id}_${key}` : `lanne_anon_${key}`

  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(storageKey)
      if (item === null || item === 'undefined' || item === 'null') return initialValue
      const parsed = JSON.parse(item)
      return parsed !== null && parsed !== undefined ? parsed : initialValue
    } catch (error) {
      console.error(`Error reading storage key "${storageKey}":`, error)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      if (storedValue !== undefined && storedValue !== null) {
        localStorage.setItem(storageKey, JSON.stringify(storedValue))
      }
    } catch (error) {
      console.error(`Error saving storage key "${storageKey}":`, error)
    }
  }, [storageKey, storedValue])

  return [storedValue, setStoredValue]
}
