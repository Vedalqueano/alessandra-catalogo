import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Lock, LogIn, AlertCircle } from 'lucide-react';

export default function Login({ onLoginSuccess, onCancel }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            onLoginSuccess();
        } catch (err) {
            setError('E-mail ou senha incorretos. Tente novamente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(252, 249, 242, 0.95)', // brand bg color
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000
        }}>
            <div className="glass fade-in" style={{
                padding: '3rem', borderRadius: '16px', maxWidth: '400px', width: '90%',
                boxShadow: '0 20px 50px rgba(92, 77, 68, 0.1)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'var(--accent-gold)', display: 'inline-flex',
                        alignItems: 'center', justifyContent: 'center', color: 'white',
                        marginBottom: '1rem'
                    }}>
                        <Lock size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Acesso Restrito</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Faça login para gerenciar os álbuns da Star Bella.</p>
                </div>

                {error && (
                    <div style={{
                        background: '#FEE2E2', color: '#991B1B', padding: '12px',
                        borderRadius: '8px', marginBottom: '1.5rem', display: 'flex',
                        alignItems: 'center', gap: '8px', fontSize: '0.9rem'
                    }}>
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-muted)' }}>E-mail Administrativo</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: '8px',
                                border: '1px solid var(--border-color)', outline: 'none',
                                background: 'rgba(255,255,255,0.8)', fontSize: '1rem',
                                fontFamily: 'inherit', color: 'var(--text-main)'
                            }}
                            placeholder="lojista@starbella.com.br"
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-muted)' }}>Senha</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: '8px',
                                border: '1px solid var(--border-color)', outline: 'none',
                                background: 'rgba(255,255,255,0.8)', fontSize: '1rem',
                                fontFamily: 'inherit', color: 'var(--text-main)'
                            }}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-gold"
                        style={{
                            padding: '14px', marginTop: '0.5rem', width: '100%',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                            opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {loading ? 'Entrando...' : <><LogIn size={18} /> Entrar no Painel</>}
                    </button>

                    <button
                        type="button"
                        onClick={onCancel}
                        style={{
                            background: 'transparent', border: 'none', color: 'var(--text-muted)',
                            cursor: 'pointer', padding: '8px', marginTop: '0.5rem', textDecoration: 'underline'
                        }}
                    >
                        Voltar para o catálogo
                    </button>
                </form>
            </div>
        </div>
    );
}
