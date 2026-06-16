import { useState } from 'react'
import { usePage, router } from '@inertiajs/react'
import Navbar from '../Components/Navbar'
import { apiFetch } from '../hooks/useApi'

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
    if (!message) return null
    const c = type === 'error'
        ? { bg: '#fee2e2', border: '#fca5a5', color: '#991b1b', icon: '❌' }
        : { bg: '#d1fae5', border: '#6ee7b7', color: '#065f46', icon: '✅' }
    return (
        <div style={{ position: 'fixed', top: 70, right: 20, zIndex: 500, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', maxWidth: 320 }}>
            <span style={{ fontSize: 18 }}>{c.icon}</span>
            <span style={{ fontSize: 14, color: c.color, fontWeight: 500, flex: 1 }}>{message}</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.color, fontSize: 18, padding: 0 }}>×</button>
        </div>
    )
}

// ── Preview do avatar ─────────────────────────────────────────────────────────
function AvatarPreview({ name, avatar, size = 80 }) {
    const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'
    const colors   = ['#3b5998','#8b5cf6','#059669','#dc2626','#d97706','#0ea5e9','#ec4899']
    const color    = colors[name?.charCodeAt(0) % colors.length] || '#3b5998'
    if (avatar) return (
        <img src={avatar} alt={name}
            style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
            onError={e => { e.target.style.display = 'none' }}
        />
    )
    return (
        <div style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: size * 0.33, fontFamily: 'Georgia, serif', border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
            {initials}
        </div>
    )
}

// ── Input padrão ──────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, error, hint, type = 'text' }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1c1e21', marginBottom: 6 }}>{label}</label>
            <input
                type={type} value={value} placeholder={placeholder}
                onChange={onChange}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', border: `1.5px solid ${error ? '#dc2626' : '#dddfe2'}`, outline: 'none', fontFamily: 'inherit', transition: 'border-color .15s' }}
                onFocus={e => e.target.style.borderColor = '#3b5998'}
                onBlur={e => e.target.style.borderColor = error ? '#dc2626' : '#dddfe2'}
            />
            {error && <p style={{ fontSize: 12, color: '#dc2626', margin: '4px 0 0' }}>{error}</p>}
            {hint && !error && <p style={{ fontSize: 12, color: '#65676b', margin: '4px 0 0' }}>{hint}</p>}
        </div>
    )
}

// ── Seção: Aparência do perfil (nome + avatar + capa) ─────────────────────────
function AppearanceSection({ user, onToast, onChange }) {
    const [name,       setName]       = useState(user.name        || '')
    const [avatarUrl,  setAvatarUrl]  = useState(user.avatar      || '')
    const [coverUrl,   setCoverUrl]   = useState(user.cover_image || '')
    const [loading,    setLoading]    = useState(false)
    const [errors,     setErrors]     = useState({})

    // Previews em tempo real
    const avatarPreview = avatarUrl || undefined
    const coverPreview  = coverUrl  || null

    async function handleSave(e) {
        e.preventDefault()
        const errs = {}
        if (!name.trim())      errs.name = 'O nome é obrigatório'
        if (name.length > 100) errs.name = 'Máximo 100 caracteres'
        if (avatarUrl && !/^https?:\/\/.+/.test(avatarUrl)) errs.avatar     = 'URL inválida'
        if (coverUrl  && !/^https?:\/\/.+/.test(coverUrl))  errs.cover_image = 'URL inválida'
        if (Object.keys(errs).length > 0) { setErrors(errs); return }

        setLoading(true)
        setErrors({})
        try {
            // Salva nome/bio
            const dataProfile = await apiFetch(`/perfil/${user.username}`, 'PUT', { name, bio: user.bio })
            // Salva avatar
            const dataAvatar  = await apiFetch(`/perfil/${user.username}/avatar`, 'PUT', { avatar: avatarUrl || null })
            // Salva capa
            const dataCover   = await apiFetch(`/perfil/${user.username}/capa`, 'PUT', { cover_image: coverUrl || null })

            onChange({ name: dataProfile.name, avatar: dataAvatar.avatar, cover_image: dataCover.cover_image })
            onToast('Perfil atualizado com sucesso!', 'success')
        } catch (err) {
            setErrors({ general: err.message || 'Erro ao salvar' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #dddfe2', overflow: 'hidden', marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f2f5' }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1c1e21', fontFamily: 'Georgia, serif' }}>
                    🎨 Aparência do perfil
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#65676b' }}>Nome, foto de perfil e imagem de capa</p>
            </div>

            <form onSubmit={handleSave} style={{ padding: 20 }}>
                {errors.general && (
                    <div style={{ background: '#fee2e2', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#dc2626' }}>{errors.general}</div>
                )}

                {/* ── Pré-visualização ── */}
                <div style={{ marginBottom: 20, borderRadius: 10, overflow: 'hidden', border: '1px solid #dddfe2' }}>
                    {/* Capa preview */}
                    <div style={{
                        height: 110, position: 'relative',
                        background: coverPreview
                            ? `url(${coverPreview}) center/cover no-repeat`
                            : 'linear-gradient(135deg,#3b5998 0%,#8b5cf6 60%,#ec4899 100%)',
                    }}>
                        <div style={{ position: 'absolute', bottom: -32, left: 16 }}>
                            <AvatarPreview name={name || user.name} avatar={avatarPreview} size={64} />
                        </div>
                    </div>
                    <div style={{ padding: '40px 16px 12px', background: '#fafafa' }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#1c1e21' }}>{name || user.name}</div>
                        <div style={{ fontSize: 13, color: '#65676b' }}>@{user.username}</div>
                        <p style={{ fontSize: 11, color: '#9ca3af', margin: '6px 0 0' }}>👁️ Pré-visualização em tempo real</p>
                    </div>
                </div>

                {/* ── Nome ── */}
                <Field
                    label="Nome completo *"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    error={errors.name}
                />

                {/* ── Username (readonly) ── */}
                <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1c1e21', marginBottom: 6 }}>Nome de usuário</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input value={`@${user.username}`} disabled style={{ flex: 1, padding: '10px 14px', borderRadius: 8, fontSize: 14, border: '1.5px solid #dddfe2', background: '#f9fafb', color: '#65676b', cursor: 'not-allowed', fontFamily: 'inherit' }} />
                        <span style={{ fontSize: 12, color: '#65676b', background: '#f0f2f5', padding: '6px 10px', borderRadius: 6, whiteSpace: 'nowrap' }}>🔒 Fixo</span>
                    </div>
                </div>

                {/* ── URL do avatar ── */}
                <Field
                    label="📷 Foto de perfil (URL)"
                    value={avatarUrl}
                    onChange={e => setAvatarUrl(e.target.value)}
                    placeholder="https://exemplo.com/sua-foto.jpg"
                    error={errors.avatar}
                    hint="Cole a URL de uma imagem pública. Use Imgur ou PostImages."
                    type="url"
                />
                {avatarUrl && (
                    <button type="button" onClick={() => setAvatarUrl('')} style={{ marginTop: -8, marginBottom: 16, background: 'none', border: 'none', fontSize: 12, color: '#dc2626', cursor: 'pointer', padding: 0 }}>
                        × Remover foto
                    </button>
                )}

                {/* ── URL da capa ── */}
                <Field
                    label="🖼️ Imagem de capa / banner (URL)"
                    value={coverUrl}
                    onChange={e => setCoverUrl(e.target.value)}
                    placeholder="https://exemplo.com/sua-capa.jpg"
                    error={errors.cover_image}
                    hint="Imagem que aparece no topo do seu perfil. Recomendado: 1200×300px."
                    type="url"
                />
                {coverUrl && (
                    <button type="button" onClick={() => setCoverUrl('')} style={{ marginTop: -8, marginBottom: 16, background: 'none', border: 'none', fontSize: 12, color: '#dc2626', cursor: 'pointer', padding: 0 }}>
                        × Remover capa
                    </button>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" disabled={loading} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: loading ? '#93acd8' : '#3b5998', color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}>
                        {loading ? 'Salvando...' : '💾 Salvar aparência'}
                    </button>
                </div>
            </form>
        </div>
    )
}

// ── Seção: Bio ────────────────────────────────────────────────────────────────
function BioSection({ user, onToast, onChange }) {
    const [bio,     setBio]     = useState(user.bio || '')
    const [loading, setLoading] = useState(false)
    const [error,   setError]   = useState('')

    async function handleSave(e) {
        e.preventDefault()
        if (bio.length > 300) { setError('Máximo 300 caracteres'); return }
        setLoading(true)
        setError('')
        try {
            await apiFetch(`/perfil/${user.username}`, 'PUT', { name: user.name, bio })
            onChange({ bio })
            onToast('Bio atualizada!', 'success')
        } catch (err) {
            setError(err.message || 'Erro ao salvar')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #dddfe2', overflow: 'hidden', marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f2f5' }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1c1e21', fontFamily: 'Georgia, serif' }}>📝 Bio</h2>
            </div>
            <form onSubmit={handleSave} style={{ padding: 20 }}>
                <textarea value={bio} rows={3} placeholder="Conte um pouco sobre você... curso, interesses, projetos"
                    onChange={e => setBio(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14, border: `1.5px solid ${error ? '#dc2626' : '#dddfe2'}`, outline: 'none', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box', transition: 'border-color .15s' }}
                    onFocus={e => e.target.style.borderColor = '#3b5998'}
                    onBlur={e => e.target.style.borderColor = error ? '#dc2626' : '#dddfe2'}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <span style={{ fontSize: 12, color: error ? '#dc2626' : bio.length > 280 ? '#d97706' : '#65676b' }}>
                        {error || `${bio.length}/300`}
                    </span>
                    <button type="submit" disabled={loading} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: loading ? '#93acd8' : '#3b5998', color: '#fff', fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer' }}>
                        {loading ? 'Salvando...' : '💾 Salvar bio'}
                    </button>
                </div>
            </form>
        </div>
    )
}

// ── Seção: Senha ──────────────────────────────────────────────────────────────
function PasswordSection({ user, onToast }) {
    const [form,     setForm]     = useState({ current_password: '', password: '', password_confirmation: '' })
    const [errors,   setErrors]   = useState({})
    const [loading,  setLoading]  = useState(false)
    const [showPass, setShowPass] = useState(false)

    function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })) }

    async function handleSave(e) {
        e.preventDefault()
        const errs = {}
        if (!form.current_password)   errs.current_password = 'Informe a senha atual'
        if (form.password.length < 8) errs.password         = 'Mínimo 8 caracteres'
        if (form.password !== form.password_confirmation) errs.password_confirmation = 'As senhas não coincidem'
        if (Object.keys(errs).length > 0) { setErrors(errs); return }

        setLoading(true); setErrors({})
        try {
            const data = await apiFetch(`/perfil/${user.username}/senha`, 'PUT', form)
            setForm({ current_password: '', password: '', password_confirmation: '' })
            onToast(data.message, 'success')
        } catch (err) {
            setErrors({ current_password: err.message })
        } finally {
            setLoading(false)
        }
    }

    const strength = (() => {
        const p = form.password; if (!p) return 0
        let s = 0
        if (p.length >= 8) s++; if (p.length >= 12) s++
        if (/[A-Z]/.test(p)) s++; if (/[0-9]/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++
        return s
    })()
    const strengthColor = ['','#dc2626','#d97706','#0ea5e9','#059669','#059669'][strength]
    const strengthLabel = ['','Fraca','Razoável','Boa','Forte','Muito forte'][strength]

    function PwField({ label, field }) {
        return (
            <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#1c1e21', marginBottom: 6 }}>{label}</label>
                <div style={{ position: 'relative' }}>
                    <input type={showPass ? 'text' : 'password'} value={form[field]} onChange={set(field)}
                        style={{ width: '100%', padding: '10px 44px 10px 14px', borderRadius: 8, fontSize: 14, border: `1.5px solid ${errors[field] ? '#dc2626' : '#dddfe2'}`, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color .15s' }}
                        onFocus={e => e.target.style.borderColor = '#3b5998'}
                        onBlur={e => e.target.style.borderColor = errors[field] ? '#dc2626' : '#dddfe2'}
                    />
                    <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#65676b', padding: 0 }}>
                        {showPass ? '🙈' : '👁️'}
                    </button>
                </div>
                {errors[field] && <p style={{ fontSize: 12, color: '#dc2626', margin: '4px 0 0' }}>{errors[field]}</p>}
            </div>
        )
    }

    return (
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #dddfe2', overflow: 'hidden', marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f2f5' }}>
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1c1e21', fontFamily: 'Georgia, serif' }}>🔒 Alterar senha</h2>
            </div>
            <form onSubmit={handleSave} style={{ padding: 20 }}>
                <PwField label="Senha atual *" field="current_password" />
                <PwField label="Nova senha *" field="password" />
                {form.password.length > 0 && (
                    <div style={{ marginTop: -8, marginBottom: 16 }}>
                        <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                            {[1,2,3,4,5].map(i => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= strength ? strengthColor : '#e5e7eb', transition: 'background .2s' }} />)}
                        </div>
                        <span style={{ fontSize: 12, color: strengthColor, fontWeight: 600 }}>{strengthLabel}</span>
                    </div>
                )}
                <PwField label="Confirmar nova senha *" field="password_confirmation" />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" disabled={loading} style={{ padding: '9px 22px', borderRadius: 8, border: 'none', background: loading ? '#93acd8' : '#3b5998', color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer' }}>
                        {loading ? 'Salvando...' : '🔑 Alterar senha'}
                    </button>
                </div>
            </form>
        </div>
    )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function EditProfile() {
    const { user: initialUser } = usePage().props
    const [user,  setUser]  = useState(initialUser)
    const [toast, setToast] = useState({ message: '', type: 'success' })

    function showToast(message, type = 'success') {
        setToast({ message, type })
        setTimeout(() => setToast({ message: '', type: 'success' }), 4000)
    }

    function handleChange(data) {
        setUser(u => ({ ...u, ...data }))
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
            <Navbar />
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />

            <div style={{ maxWidth: 780, margin: '0 auto', padding: '24px 16px' }}>
                {/* Cabeçalho */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <button onClick={() => router.visit(`/perfil/${user.username}`)} style={{ background: '#fff', border: '1px solid #dddfe2', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 13, color: '#65676b', fontWeight: 600 }}>
                        ← Voltar ao perfil
                    </button>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1c1e21', fontFamily: 'Georgia, serif' }}>⚙️ Editar perfil</h1>
                        <p style={{ margin: '2px 0 0', fontSize: 13, color: '#65676b' }}>@{user.username}</p>
                    </div>
                </div>

                <AppearanceSection user={user} onToast={showToast} onChange={handleChange} />
                <BioSection        user={user} onToast={showToast} onChange={handleChange} />
                <PasswordSection   user={user} onToast={showToast} />
            </div>
        </div>
    )
}