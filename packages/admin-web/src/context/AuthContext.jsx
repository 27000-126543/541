import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '')
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('admin_user') || 'null'))

  const login = (token, userInfo) => {
    setToken(token)
    setUser(userInfo)
    localStorage.setItem('admin_token', token)
    localStorage.setItem('admin_user', JSON.stringify(userInfo))
  }

  const logout = () => {
    setToken('')
    setUser(null)
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
  }

  const updateUser = (userInfo) => {
    setUser(userInfo)
    localStorage.setItem('admin_user', JSON.stringify(userInfo))
  }

  const isAuthenticated = !!token && !!user

  const value = {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
