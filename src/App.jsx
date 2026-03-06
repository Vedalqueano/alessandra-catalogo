import React, { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import Catalogue from './components/Catalogue'
import Login from './components/Login'
import { Settings, ExternalLink } from 'lucide-react'
import { auth } from './firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setIsAdmin(false);
  };

  return (
    <>
      {showLogin && !user && (
        <Login
          onLoginSuccess={() => { setShowLogin(false); setIsAdmin(true); }}
          onCancel={() => setShowLogin(false)}
        />
      )}

      {/* Floating Toggle */}
      <div style={{
        position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
        display: 'flex', gap: '10px'
      }}>
        <button
          onClick={() => {
            if (isAdmin) {
              setIsAdmin(false);
            } else {
              if (user) {
                setIsAdmin(true);
              } else {
                setShowLogin(true);
              }
            }
          }}
          className="glass"
          style={{
            padding: isAdmin ? '8px 16px' : '10px',
            borderRadius: isAdmin ? '20px' : '50%',
            border: isAdmin ? '1px solid var(--border-color)' : 'none',
            color: isAdmin ? 'white' : 'var(--text-muted)',
            background: isAdmin ? '#1a1a1a' : 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            boxShadow: isAdmin ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          {isAdmin ? (
            <><ExternalLink size={16} /> Ver Catálogo Público</>
          ) : (
            <Settings size={20} color="var(--text-muted)" />
          )}
        </button>
      </div>

      {isAdmin && user ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <Catalogue />
      )}
    </>
  )
}

export default App
