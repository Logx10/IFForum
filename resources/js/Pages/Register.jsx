import { useState } from 'react'
import { router, usePage } from '@inertiajs/react'

// ── Field FORA do componente Register para não recriar a cada render ──────────
function Field({ label, name, type, placeholder, showPass, onTogglePass, value, onChange, error }) {
    const isPassword = type === 'password'
    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1c1e21', marginBottom: 6 }}>
                {label}
            </label>
            <div style={{ position: 'relative' }}>
                <input
                    type={isPassword && showPass ? 'text' : (type || 'text')}
                    value={value}
                    placeholder={placeholder}
                    onChange={onChange}
                    style={{
                        width: '100%', padding: '11px 14px', borderRadius: 8, fontSize: 14,
                        border: `1.5px solid ${error ? '#dc2626' : '#dddfe2'}`,
                        outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                        background: '#fff', transition: 'border-color .15s',
                        paddingRight: isPassword ? 44 : 14,
                    }}
                    onFocus={e => e.target.style.borderColor = '#3b5998'}
                    onBlur={e => e.target.style.borderColor = error ? '#dc2626' : '#dddfe2'}
                />
                {isPassword && (
                    <button type="button" onClick={onTogglePass} style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', fontSize: 18,
                        color: '#65676b', padding: 0,
                    }}>
                        {showPass ? '🙈' : '👁️'}
                    </button>
                )}
            </div>
            {error && <p style={{ fontSize: 12, color: '#dc2626', margin: '4px 0 0' }}>{error}</p>}
        </div>
    )
}

export default function Register() {
    const { errors: serverErrors } = usePage().props
    const [form, setForm]     = useState({ name: '', username: '', email: '', password: '', password_confirmation: '' })
    const [errors, setErrors] = useState(serverErrors || {})
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState(false)
    const [step, setStep]     = useState(1)

    function set(field) {
        return e => setForm(f => ({ ...f, [field]: e.target.value }))
    }

    function validateStep1() {
        const errs = {}
        if (!form.name.trim())     errs.name     = 'O nome é obrigatório'
        if (!form.username.trim()) errs.username  = 'O usuário é obrigatório'
        if (form.username.length < 3) errs.username = 'Mínimo 3 caracteres'
        if (!form.email.trim())    errs.email    = 'O e-mail é obrigatório'
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'E-mail inválido'
        return errs
    }

    function validateStep2() {
        const errs = {}
        if (!form.password)           errs.password = 'A senha é obrigatória'
        if (form.password.length < 8) errs.password = 'Mínimo 8 caracteres'
        if (form.password !== form.password_confirmation) errs.password_confirmation = 'As senhas não coincidem'
        return errs
    }

    function handleNext(e) {
        e.preventDefault()
        const errs = validateStep1()
        if (Object.keys(errs).length > 0) { setErrors(errs); return }
        setErrors({})
        setStep(2)
    }

    function handleSubmit(e) {
        e.preventDefault()
        const errs = validateStep2()
        if (Object.keys(errs).length > 0) { setErrors(errs); return }
        setLoading(true)
        router.post('/register', form, {
            onError:  (e) => { setErrors(e); setLoading(false) },
            onFinish: ()  => setLoading(false),
        })
    }

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
                <div style={{ width: '100%', maxWidth: 460 }}>
                    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #dddfe2', padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>

                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <div style={{ fontSize: 48, marginBottom: 8 }}>🗣️</div>
                            <h1 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800, color: '#1c1e21', fontFamily: 'Georgia, serif' }}>
                                Criar conta no IFForum
                            </h1>
                            <p style={{ margin: 0, fontSize: 14, color: '#65676b' }}>Junte-se à comunidade IFCE!</p>
                        </div>

                        {/* Steps */}
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24, gap: 8 }}>
                            {[1, 2].map(s => (
                                <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '50%',
                                        background: step >= s ? '#3b5998' : '#e4e6ea',
                                        color: step >= s ? '#fff' : '#65676b',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 700, fontSize: 13, flexShrink: 0, transition: 'background .2s',
                                    }}>{s}</div>
                                    <span style={{ marginLeft: 6, fontSize: 12, color: step >= s ? '#3b5998' : '#65676b', fontWeight: step >= s ? 600 : 400, whiteSpace: 'nowrap' }}>
                                        {s === 1 ? 'Seus dados' : 'Sua senha'}
                                    </span>
                                    {s < 2 && <div style={{ flex: 1, height: 2, background: step > s ? '#3b5998' : '#e4e6ea', margin: '0 8px', transition: 'background .2s' }} />}
                                </div>
                            ))}
                        </div>

                        {step === 1 ? (
                            <form onSubmit={handleNext}>
                                <Field label="Nome completo" name="name" placeholder="João Silva"
                                    value={form.name} onChange={set('name')} error={errors.name} />
                                <Field label="Nome de usuário" name="username" placeholder="joaosilva"
                                    value={form.username} onChange={set('username')} error={errors.username} />
                                <Field label="E-mail" name="email" type="email" placeholder="joao@aluno.ifce.edu.br"
                                    value={form.email} onChange={set('email')} error={errors.email} />
                                <button type="submit" style={{
                                    width: '100%', padding: '12px 0', borderRadius: 8, border: 'none',
                                    background: '#3b5998', color: '#fff', fontWeight: 700, fontSize: 15,
                                    cursor: 'pointer', marginTop: 4,
                                }}>Continuar →</button>
                            </form>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <Field label="Senha" name="password" type="password" placeholder="Mínimo 8 caracteres"
                                    value={form.password} onChange={set('password')} error={errors.password}
                                    showPass={showPass} onTogglePass={() => setShowPass(s => !s)} />
                                <Field label="Confirmar senha" name="password_confirmation" type="password" placeholder="Repita a senha"
                                    value={form.password_confirmation} onChange={set('password_confirmation')} error={errors.password_confirmation}
                                    showPass={showPass} onTogglePass={() => setShowPass(s => !s)} />

                                <div style={{ background: '#f0f2f5', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#65676b' }}>
                                    <strong>Dica de senha segura:</strong> Use letras maiúsculas, minúsculas e números.
                                </div>

                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button type="button" onClick={() => setStep(1)} style={{
                                        flex: 1, padding: '12px 0', borderRadius: 8,
                                        border: '1.5px solid #dddfe2', background: '#fff',
                                        color: '#1c1e21', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                                    }}>← Voltar</button>
                                    <button type="submit" disabled={loading} style={{
                                        flex: 2, padding: '12px 0', borderRadius: 8, border: 'none',
                                        background: loading ? '#93acd8' : '#3b5998', color: '#fff',
                                        fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
                                    }}>
                                        {loading ? 'Criando conta...' : '🎉 Criar minha conta'}
                                    </button>
                                </div>
                            </form>
                        )}

                        <div style={{ textAlign: 'center', borderTop: '1px solid #dddfe2', paddingTop: 16, marginTop: 20 }}>
                            <span style={{ fontSize: 14, color: '#65676b' }}>Já tem conta? </span>
                            <button onClick={() => router.visit('/login')} style={{
                                background: 'none', border: 'none', fontSize: 14,
                                color: '#3b5998', cursor: 'pointer', fontWeight: 700,
                            }}>Entrar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
