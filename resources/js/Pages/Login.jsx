import { useState } from 'react'
import { router, usePage } from '@inertiajs/react'

export default function Login() {
    const { errors: serverErrors } = usePage().props
    const [email, setEmail]       = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading]   = useState(false)
    const [errors, setErrors]     = useState(serverErrors || {})
    const [showPass, setShowPass] = useState(false)

    function handleSubmit(e) {
        e.preventDefault()
        const errs = {}
        if (!email)    errs.email    = 'O e-mail é obrigatório'
        if (!password) errs.password = 'A senha é obrigatória'
        if (Object.keys(errs).length > 0) { setErrors(errs); return }
        setLoading(true)
        router.post('/login', { email, password }, {
            onError:   (e) => { setErrors(e); setLoading(false) },
            onFinish:  ()  => setLoading(false),
        })
    }

    const inputStyle = (err) => ({
        width: '100%', padding: '11px 14px', borderRadius: 8, fontSize: 14,
        border: `1.5px solid ${err ? '#dc2626' : '#dddfe2'}`,
        outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
        transition: 'border-color .15s', background: '#fff',
    })

    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Helvetica Neue, Arial, sans-serif', display: 'flex', flexDirection: 'column' }}>
            {/* Navbar */}
            <div style={{ background: '#3b5998', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', padding: '0 16px', height: 50, display: 'flex', alignItems: 'center' }}>
                <button onClick={() => router.visit('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
                    <span style={{ fontSize: 22 }}>🗣️</span>
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: 18, fontFamily: 'Georgia, serif' }}>IFForum</span>
                </button>
            </div>

            {/* Conteúdo */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
                <div style={{ width: '100%', maxWidth: 420 }}>

                    {/* Card */}
                    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #dddfe2', padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
                        <div style={{ textAlign: 'center', marginBottom: 28 }}>
                            <div style={{ fontSize: 48, marginBottom: 8 }}>🗣️</div>
                            <h1 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 800, color: '#1c1e21', fontFamily: 'Georgia, serif' }}>
                                Entrar no IFForum
                            </h1>
                            <p style={{ margin: 0, fontSize: 14, color: '#65676b' }}>
                                Bem-vindo de volta, estudante do IFCE!
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1c1e21', marginBottom: 6 }}>
                                    E-mail
                                </label>
                                <input type="email" value={email} placeholder="seu@email.com"
                                    onChange={e => setEmail(e.target.value)}
                                    style={inputStyle(errors.email)}
                                    onFocus={e => e.target.style.borderColor = '#3b5998'}
                                    onBlur={e => e.target.style.borderColor = errors.email ? '#dc2626' : '#dddfe2'}
                                />
                                {errors.email && <p style={{ fontSize: 12, color: '#dc2626', margin: '4px 0 0' }}>{errors.email}</p>}
                            </div>

                            <div style={{ marginBottom: 8 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1c1e21', marginBottom: 6 }}>
                                    Senha
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input type={showPass ? 'text' : 'password'} value={password} placeholder="••••••••"
                                        onChange={e => setPassword(e.target.value)}
                                        style={{ ...inputStyle(errors.password), paddingRight: 44 }}
                                        onFocus={e => e.target.style.borderColor = '#3b5998'}
                                        onBlur={e => e.target.style.borderColor = errors.password ? '#dc2626' : '#dddfe2'}
                                    />
                                    <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#65676b', padding: 0 }}>
                                        {showPass ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                {errors.password && <p style={{ fontSize: 12, color: '#dc2626', margin: '4px 0 0' }}>{errors.password}</p>}
                            </div>

                            <div style={{ textAlign: 'right', marginBottom: 20 }}>
                                <button type="button" style={{ background: 'none', border: 'none', fontSize: 13, color: '#3b5998', cursor: 'pointer', fontWeight: 600 }}>
                                    Esqueceu a senha?
                                </button>
                            </div>

                            <button type="submit" disabled={loading} style={{
                                width: '100%', padding: '12px 0', borderRadius: 8, border: 'none',
                                background: loading ? '#93acd8' : '#3b5998', color: '#fff',
                                fontWeight: 700, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'background .15s', marginBottom: 16,
                            }}>
                                {loading ? 'Entrando...' : 'Entrar'}
                            </button>

                            <div style={{ textAlign: 'center', borderTop: '1px solid #dddfe2', paddingTop: 16 }}>
                                <span style={{ fontSize: 14, color: '#65676b' }}>Não tem conta? </span>
                                <button type="button" onClick={() => router.visit('/register')} style={{ background: 'none', border: 'none', fontSize: 14, color: '#3b5998', cursor: 'pointer', fontWeight: 700 }}>
                                    Cadastre-se
                                </button>
                            </div>
                        </form>
                    </div>

                    <p style={{ textAlign: 'center', fontSize: 12, color: '#65676b', marginTop: 16 }}>
                        IFForum · Comunidade IFCE Campus Tianguá
                    </p>
                </div>
            </div>
        </div>
    )
}
