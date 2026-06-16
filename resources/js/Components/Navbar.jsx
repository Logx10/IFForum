import { useState, useRef, useEffect } from 'react'
import { usePage, router } from '@inertiajs/react'

function Avatar({ name, avatar, size = 36 }) {
    const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'
    const colors = ['#3b5998','#8b5cf6','#059669','#dc2626','#d97706','#0ea5e9','#ec4899']
    const color = colors[name?.charCodeAt(0) % colors.length] || '#3b5998'
    if (avatar) return (
        <img src={avatar} alt={name} style={{
            width: size, height: size, borderRadius: '50%', objectFit: 'cover',
            border: '2px solid rgba(255,255,255,0.5)',
        }} />
    )
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%', background: color, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: size * 0.35, fontFamily: 'Georgia, serif',
            border: '2px solid rgba(255,255,255,0.5)',
        }}>{initials}</div>
    )
}

export default function Navbar({ isMobile, onNewPost, showNewPost = true }) {
    const { auth } = usePage().props
    const user = auth?.user
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [searchOpen,   setSearchOpen]   = useState(false)
    const [searchText,   setSearchText]   = useState('')
    const dropdownRef = useRef(null)
    const searchRef   = useRef(null)

    function handleSearch(e) {
        e.preventDefault()
        if (!searchText.trim()) return
        router.get('/', { search: searchText.trim() }, { preserveScroll: false })
        setSearchOpen(false)
        setSearchText('')
    }

    function handleSearchKey(e) {
        if (e.key === 'Escape') { setSearchOpen(false); setSearchText('') }
    }

    // Fecha dropdown ao clicar fora
    useEffect(() => {
        function handleClick(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    function handleLogout() {
        router.post('/logout')
        setDropdownOpen(false)
    }

    return (
        <div style={{
            position: 'sticky', top: 0, zIndex: 100,
            background: '#3b5998', boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}>
            <div style={{
                maxWidth: 1100, margin: '0 auto', padding: '0 16px',
                height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                {/* Logo */}
                <button onClick={() => router.visit('/')} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}>
                    <span style={{ fontSize: 22 }}>🗣️</span>
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: 18, fontFamily: 'Georgia, serif' }}>IFForum</span>
                </button>

                {/* Lado direito */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

                    {/* Botão novo post no mobile */}
                    {isMobile && (
                        <>
                            {searchOpen
                                ? (
                                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                        <input
                                            ref={searchRef}
                                            autoFocus
                                            type="text"
                                            value={searchText}
                                            placeholder="Buscar..."
                                            onChange={e => setSearchText(e.target.value)}
                                            onKeyDown={handleSearchKey}
                                            style={{ padding: '6px 12px', borderRadius: 20, border: 'none', fontSize: 13, background: 'rgba(255,255,255,0.2)', color: '#fff', outline: 'none', width: 140 }}
                                        />
                                        <button type="submit" style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 18, padding: 0 }}>→</button>
                                        <button type="button" onClick={() => { setSearchOpen(false); setSearchText('') }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 18, padding: 0 }}>×</button>
                                    </form>
                                ) : (
                                    <button onClick={() => setSearchOpen(true)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20, padding: '4px 6px' }}>🔍</button>
                                )
                            }
                        </>
                    )}

                    {isMobile && showNewPost && onNewPost && (
                        <button onClick={onNewPost} style={{
                            background: '#fff', border: 'none', borderRadius: 6,
                            padding: '6px 12px', color: '#3b5998', fontWeight: 700,
                            fontSize: 13, cursor: 'pointer',
                        }}>✏️ Novo Post</button>
                    )}

                    {user ? (
                        /* ── Usuário logado ─────────────────────────── */
                        <div ref={dropdownRef} style={{ position: 'relative' }}>
                            <button onClick={() => setDropdownOpen(o => !o)} style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                background: 'rgba(255,255,255,0.12)', border: 'none',
                                borderRadius: 20, padding: '4px 12px 4px 4px',
                                cursor: 'pointer', transition: 'background .15s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.22)'}
                                onMouseLeave={e => e.currentTarget.style.background = dropdownOpen ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.12)'}
                            >
                                <Avatar name={user.name} avatar={user.avatar} size={32} />
                                {!isMobile && (
                                    <span style={{ color: '#fff', fontWeight: 600, fontSize: 13, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {user.name.split(' ')[0]}
                                    </span>
                                )}
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10 }}>▼</span>
                            </button>

                            {/* Dropdown */}
                            {dropdownOpen && (
                                <div style={{
                                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                                    background: '#fff', borderRadius: 8, border: '1px solid #dddfe2',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)', minWidth: 200,
                                    overflow: 'hidden', zIndex: 200,
                                }}>
                                    {/* Header do dropdown */}
                                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <Avatar name={user.name} avatar={user.avatar} size={40} />
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: 14, color: '#1c1e21' }}>{user.name}</div>
                                            <div style={{ fontSize: 12, color: '#65676b' }}>@{user.username}</div>
                                        </div>
                                    </div>

                                    {/* Itens */}
                                    {[
                                        { icon: '👤', label: 'Meu perfil', action: () => { router.visit(`/perfil/${user.username}`); setDropdownOpen(false) } },
                                        { icon: '📝', label: 'Meus posts',  action: () => { router.visit(`/perfil/${user.username}`); setDropdownOpen(false) } },
                                        { icon: '⚙️', label: 'Configurações', action: () => setDropdownOpen(false) },
                                    ].map(item => (
                                        <button key={item.label} onClick={item.action} style={{
                                            width: '100%', textAlign: 'left', border: 'none',
                                            background: 'none', padding: '10px 16px', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            fontSize: 14, color: '#1c1e21', transition: 'background .1s',
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#f0f2f5'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                        >
                                            <span style={{ fontSize: 16 }}>{item.icon}</span>
                                            {item.label}
                                        </button>
                                    ))}

                                    <div style={{ borderTop: '1px solid #f0f2f5' }}>
                                        <button onClick={handleLogout} style={{
                                            width: '100%', textAlign: 'left', border: 'none',
                                            background: 'none', padding: '10px 16px', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            fontSize: 14, color: '#dc2626', transition: 'background .1s',
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                        >
                                            <span style={{ fontSize: 16 }}>🚪</span>
                                            Sair
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* ── Visitante ──────────────────────────────── */
                        <>
                            <button onClick={() => router.visit('/login')} style={{
                                background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 6,
                                padding: '6px 14px', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                            }}>Entrar</button>
                            {!isMobile && (
                                <button onClick={() => router.visit('/register')} style={{
                                    background: '#fff', border: 'none', borderRadius: 6,
                                    padding: '6px 14px', color: '#3b5998', fontWeight: 700,
                                    fontSize: 13, cursor: 'pointer',
                                }}>Cadastrar</button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
