import { useState, useEffect } from 'react'
import { usePage, router } from '@inertiajs/react'

// ── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, avatar, size = 40 }) {
    const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'
    const colors = ['#3b5998','#8b5cf6','#059669','#dc2626','#d97706','#0ea5e9','#ec4899']
    const color = colors[name?.charCodeAt(0) % colors.length] || '#3b5998'
    if (avatar) return <img src={avatar} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%', background: color, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: size * 0.35, fontFamily: 'Georgia, serif',
        }}>
            {initials}
        </div>
    )
}

// ── PostCard ─────────────────────────────────────────────────────────────────
function PostCard({ post }) {
    const [liked, setLiked] = useState(post.is_liked || false)
    const [likesCount, setLikesCount] = useState(post.likes_count || 0)

    function handleLike() {
        setLiked(l => !l)
        setLikesCount(c => liked ? c - 1 : c + 1)
    }

    const preview = post.body?.replace(/\n/g, ' ').slice(0, 220)
    const hasMore = post.body?.length > 220

    return (
        <div style={{
            background: '#fff', borderRadius: 8, border: '1px solid #dddfe2',
            marginBottom: 16, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
            transition: 'box-shadow .2s',
        }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.13)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.08)'}
        >
            {/* Header */}
            <div style={{ padding: '14px 16px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={post.author?.name} avatar={post.author?.avatar} size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: '#1c1e21', fontFamily: 'Georgia, serif' }}>
                            {post.author?.name}
                        </span>
                        {post.is_pinned && (
                            <span style={{ fontSize: 11, background: '#fff3cd', color: '#856404', borderRadius: 4, padding: '1px 6px', fontWeight: 600 }}>
                                📌 Fixado
                            </span>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <span style={{ fontSize: 12, color: '#65676b' }}>{post.last_activity_at}</span>
                        <span style={{ color: '#bcc0c4', fontSize: 10 }}>•</span>
                        <span style={{
                            fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 20,
                            color: '#fff', background: post.category?.color || '#3b5998',
                        }}>
                            {post.category?.icon} {post.category?.name}
                        </span>
                    </div>
                </div>
            </div>

            {/* Título */}
            <div style={{ padding: '10px 16px 4px' }}>
                <h2 style={{
                    fontSize: 16, fontWeight: 700, color: '#1c1e21', fontFamily: 'Georgia, serif',
                    lineHeight: 1.4, margin: 0, cursor: 'pointer',
                }}
                    onMouseEnter={e => e.target.style.color = '#3b5998'}
                    onMouseLeave={e => e.target.style.color = '#1c1e21'}
                >
                    {post.title}
                </h2>
            </div>

            {/* Body */}
            <div style={{ padding: '4px 16px 10px' }}>
                <p style={{ fontSize: 14, color: '#3e4047', lineHeight: 1.6, margin: 0 }}>
                    {preview}
                    {hasMore && <span style={{ color: '#65676b' }}>... <span style={{ color: '#3b5998', cursor: 'pointer', fontWeight: 600 }}>ver mais</span></span>}
                </p>
            </div>

            {/* Tags */}
            {post.tags?.length > 0 && (
                <div style={{ padding: '0 16px 10px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {post.tags.map(tag => (
                        <span key={tag.id} style={{
                            fontSize: 12, color: '#3b5998', background: '#e7f0fd',
                            borderRadius: 20, padding: '2px 10px', cursor: 'pointer', fontWeight: 600,
                        }}>#{tag.name}</span>
                    ))}
                </div>
            )}

            {/* Contadores */}
            <div style={{
                padding: '6px 16px', borderTop: '1px solid #f0f2f5',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
                <span style={{ fontSize: 13, color: '#65676b', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {likesCount > 0 && <><span>👍</span> {likesCount}</>}
                </span>
                <span style={{ fontSize: 13, color: '#65676b' }}>
                    {post.comments_count > 0 && `${post.comments_count} comentário${post.comments_count > 1 ? 's' : ''}`}
                    {post.views_count > 0 && ` • ${post.views_count} views`}
                </span>
            </div>

            {/* Ações */}
            <div style={{ display: 'flex', borderTop: '1px solid #dddfe2' }}>
                {[
                    { icon: '👍', label: liked ? 'Curtido' : 'Curtir', action: handleLike, active: liked },
                    { icon: '💬', label: 'Comentar', action: () => {} },
                    { icon: '↗️', label: 'Compartilhar', action: () => {} },
                ].map(btn => (
                    <button key={btn.label} onClick={btn.action} style={{
                        flex: 1, border: 'none', background: 'none', padding: '10px 0', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        fontSize: 13, fontWeight: 600, color: btn.active ? '#3b5998' : '#65676b',
                        transition: 'background .15s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f0f2f5'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                        <span style={{ fontSize: 16 }}>{btn.icon}</span>
                        {btn.label}
                    </button>
                ))}
            </div>
        </div>
    )
}

// ── Categorias estilo Instagram Stories ──────────────────────────────────────
function CategoryStories({ categories, activeCategory, onCategory }) {
    return (
        <div style={{
            background: '#fff', borderRadius: 8, border: '1px solid #dddfe2',
            padding: '12px 0', marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
            overflowX: 'auto',
        }}>
            <div style={{
                display: 'flex', gap: 16, padding: '0 16px',
                overflowX: 'auto', scrollbarWidth: 'none', justifyContent: 'center',
            }}>
                {/* Todos */}
                <button onClick={() => onCategory(null)} style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 6, background: 'none', border: 'none', cursor: 'pointer',
                    flexShrink: 0, padding: 0,
                }}>
                    <div style={{
                        width: 60, height: 60, borderRadius: '50%',
                        background: !activeCategory
                            ? 'linear-gradient(135deg, #3b5998, #8b5cf6)'
                            : '#f0f2f5',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 26,
                        border: !activeCategory ? '3px solid #3b5998' : '3px solid transparent',
                        boxSizing: 'border-box',
                        transition: 'all .2s',
                    }}>
                        🏠
                    </div>
                    <span style={{
                        fontSize: 11, color: !activeCategory ? '#3b5998' : '#65676b',
                        fontWeight: !activeCategory ? 700 : 400, whiteSpace: 'nowrap',
                        maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>Todos</span>
                </button>

                {categories.map(cat => (
                    <button key={cat.id} onClick={() => onCategory(cat.slug)} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: 6, background: 'none', border: 'none', cursor: 'pointer',
                        flexShrink: 0, padding: 0,
                    }}>
                        <div style={{
                            width: 60, height: 60, borderRadius: '50%',
                            background: activeCategory === cat.slug
                                ? cat.color || '#3b5998'
                                : '#f0f2f5',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 26,
                            border: activeCategory === cat.slug
                                ? `3px solid ${cat.color || '#3b5998'}`
                                : '3px solid #e4e6ea',
                            boxSizing: 'border-box',
                            transition: 'all .2s',
                        }}>
                            {cat.icon || '📁'}
                        </div>
                        <span style={{
                            fontSize: 11,
                            color: activeCategory === cat.slug ? (cat.color || '#3b5998') : '#65676b',
                            fontWeight: activeCategory === cat.slug ? 700 : 400,
                            whiteSpace: 'nowrap', maxWidth: 64,
                            overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>
                            {cat.name}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    )
}

// ── Sidebar desktop ───────────────────────────────────────────────────────────
function Sidebar({ categories, activeCategory, onCategory }) {
    return (
        <div style={{ width: 280, flexShrink: 0 }}>
            {/* Info */}
            <div style={{
                background: '#fff', borderRadius: 8, border: '1px solid #dddfe2',
                overflow: 'hidden', marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #3b5998 0%, #8b5cf6 100%)',
                    padding: '24px 16px 16px', textAlign: 'center',
                }}>
                    <div style={{ fontSize: 36, marginBottom: 6 }}>🗣️</div>
                    <div style={{ color: '#fff', fontWeight: 800, fontSize: 18, fontFamily: 'Georgia, serif' }}>IFForum</div>
                    <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 12, marginTop: 4 }}>
                        Comunidade IFCE Campus Tianguá
                    </div>
                </div>
                <div style={{ padding: 16 }}>
                    <p style={{ fontSize: 13, color: '#606770', lineHeight: 1.5, margin: '0 0 12px' }}>
                        Espaço de discussão, dúvidas e compartilhamento de conhecimento dos estudantes do IFCE.
                    </p>
                    <button style={{
                        width: '100%', background: '#3b5998', color: '#fff', border: 'none',
                        borderRadius: 6, padding: '9px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                        transition: 'background .15s',
                    }}
                        onMouseEnter={e => e.target.style.background = '#2d4373'}
                        onMouseLeave={e => e.target.style.background = '#3b5998'}
                    >
                        + Novo Post
                    </button>
                </div>
            </div>

            {/* Categorias */}
            <div style={{
                background: '#fff', borderRadius: 8, border: '1px solid #dddfe2',
                overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
            }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f2f5' }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: '#1c1e21', fontFamily: 'Georgia, serif' }}>Categorias</span>
                </div>
                <div style={{ padding: '8px 0' }}>
                    <button onClick={() => onCategory(null)} style={{
                        width: '100%', textAlign: 'left', border: 'none',
                        background: !activeCategory ? '#e7f0fd' : 'none',
                        padding: '8px 16px', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', gap: 10, fontSize: 14,
                        color: !activeCategory ? '#3b5998' : '#1c1e21',
                        fontWeight: !activeCategory ? 700 : 400,
                    }}>
                        <span style={{ fontSize: 18 }}>🏠</span>
                        <span style={{ flex: 1 }}>Todos os posts</span>
                    </button>
                    {categories.map(cat => (
                        <button key={cat.id} onClick={() => onCategory(cat.slug)} style={{
                            width: '100%', textAlign: 'left', border: 'none',
                            background: activeCategory === cat.slug ? '#e7f0fd' : 'none',
                            padding: '8px 16px', cursor: 'pointer', display: 'flex',
                            alignItems: 'center', gap: 10, fontSize: 14,
                            color: activeCategory === cat.slug ? '#3b5998' : '#1c1e21',
                            fontWeight: activeCategory === cat.slug ? 700 : 400,
                            transition: 'background .15s',
                        }}
                            onMouseEnter={e => { if (activeCategory !== cat.slug) e.currentTarget.style.background = '#f0f2f5' }}
                            onMouseLeave={e => { if (activeCategory !== cat.slug) e.currentTarget.style.background = 'none' }}
                        >
                            <span style={{ fontSize: 18 }}>{cat.icon || '📁'}</span>
                            <span style={{ flex: 1 }}>{cat.name}</span>
                            <span style={{ fontSize: 12, color: '#65676b', background: '#f0f2f5', borderRadius: 20, padding: '1px 7px' }}>
                                {cat.posts_count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ── Paginação ─────────────────────────────────────────────────────────────────
function Pagination({ links }) {
    if (!links?.links) return null
    const pages = links.links.filter(l => l.label !== '&laquo; Previous' && l.label !== 'Next &raquo;')
    if (pages.length <= 1) return null
    return (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }}>
            {links.prev && (
                <button onClick={() => router.visit(links.prev)} style={{
                    padding: '6px 12px', borderRadius: 6, border: '1px solid #dddfe2',
                    background: '#fff', color: '#3b5998', fontWeight: 600, cursor: 'pointer', fontSize: 13,
                }}>← Anterior</button>
            )}
            {pages.map((link, i) => (
                <button key={i} disabled={!link.url} onClick={() => link.url && router.visit(link.url)} style={{
                    padding: '6px 12px', borderRadius: 6, border: '1px solid #dddfe2',
                    background: link.active ? '#3b5998' : '#fff',
                    color: link.active ? '#fff' : '#1c1e21',
                    fontWeight: link.active ? 700 : 400,
                    cursor: link.url ? 'pointer' : 'default', fontSize: 13,
                }}>
                    {link.label}
                </button>
            ))}
            {links.next && (
                <button onClick={() => router.visit(links.next)} style={{
                    padding: '6px 12px', borderRadius: 6, border: '1px solid #dddfe2',
                    background: '#fff', color: '#3b5998', fontWeight: 600, cursor: 'pointer', fontSize: 13,
                }}>Próxima →</button>
            )}
        </div>
    )
}

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ isMobile, onNewPost }) {
    return (
        <div style={{
            position: 'sticky', top: 0, zIndex: 100, background: '#3b5998',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        }}>
            <div style={{
                maxWidth: 1100, margin: '0 auto', padding: '0 16px',
                height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 22 }}>🗣️</span>
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: 18, fontFamily: 'Georgia, serif' }}>IFForum</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Botão Novo Post na navbar só no mobile */}
                    {isMobile && (
                        <button onClick={onNewPost} style={{
                            background: '#fff', border: 'none', borderRadius: 6,
                            padding: '6px 12px', color: '#3b5998', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                        }}>✏️ Novo Post</button>
                    )}
                    <button style={{
                        background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 6,
                        padding: '6px 14px', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    }}>Entrar</button>
                    {!isMobile && (
                        <button style={{
                            background: '#fff', border: 'none', borderRadius: 6,
                            padding: '6px 14px', color: '#3b5998', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                        }}>Cadastrar</button>
                    )}
                </div>
            </div>
        </div>
    )
}

// ── Botão flutuante Novo Post (mobile, rodapé) ────────────────────────────────
function FloatingNewPost({ onNewPost }) {
    return (
        <button onClick={onNewPost} style={{
            position: 'fixed', bottom: 24, right: 20, zIndex: 200,
            background: '#3b5998', color: '#fff', border: 'none',
            borderRadius: 50, padding: '14px 20px',
            fontWeight: 700, fontSize: 15, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(59,89,152,0.45)',
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'transform .15s, box-shadow .15s',
        }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.07)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(59,89,152,0.55)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(59,89,152,0.45)' }}
        >
            <span style={{ fontSize: 20 }}>✏️</span>
            Novo Post
        </button>
    )
}

// ── Página Principal ──────────────────────────────────────────────────────────
export default function Home() {
    const { posts, categories } = usePage().props
    const [activeCategory, setActiveCategory] = useState(null)
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 715)

    useEffect(() => {
        function handleResize() {
            setIsMobile(window.innerWidth <= 715)
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    function handleCategory(slug) {
        setActiveCategory(slug)
        router.get('/', slug ? { category: slug } : {}, { preserveScroll: true })
    }

    function handleNewPost() {
        // futuramente: router.visit('/posts/criar')
        alert('Em breve: criar novo post!')
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
            <Navbar isMobile={isMobile} onNewPost={handleNewPost} />

            <div style={{
                maxWidth: 1100, margin: '0 auto', padding: '20px 16px',
                display: 'flex', gap: 20, alignItems: 'flex-start',
            }}>
                {/* Feed principal */}
                <div style={{ flex: 1, minWidth: 0 }}>

                    {/* Stories de categoria — só no mobile */}
                    {isMobile && (
                        <CategoryStories
                            categories={categories}
                            activeCategory={activeCategory}
                            onCategory={handleCategory}
                        />
                    )}

                    {/* Barra de ordenação */}
                    <div style={{
                        background: '#fff', borderRadius: 8, border: '1px solid #dddfe2',
                        padding: '10px 16px', marginBottom: 16, display: 'flex',
                        alignItems: 'center', gap: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                        flexWrap: 'wrap',
                    }}>
                        <span style={{ fontSize: 13, color: '#65676b', fontWeight: 600 }}>Ordenar por:</span>
                        {['Recentes', 'Populares', 'Sem resposta'].map((opt, i) => (
                            <button key={opt} style={{
                                border: 'none', borderRadius: 20, padding: '5px 12px',
                                background: i === 0 ? '#e7f0fd' : 'none',
                                color: i === 0 ? '#3b5998' : '#65676b',
                                fontWeight: i === 0 ? 700 : 400, cursor: 'pointer', fontSize: 13,
                            }}>
                                {opt}
                            </button>
                        ))}
                    </div>

                    {/* Posts */}
                    {posts.data?.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 60, color: '#65676b', background: '#fff', borderRadius: 8 }}>
                            <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
                            <p>Nenhum post encontrado.</p>
                        </div>
                    ) : (
                        posts.data?.map(post => <PostCard key={post.id} post={post} />)
                    )}

                    <Pagination links={posts} />
                </div>

                {/* Sidebar — só no desktop */}
                {!isMobile && (
                    <Sidebar
                        categories={categories}
                        activeCategory={activeCategory}
                        onCategory={handleCategory}
                    />
                )}
            </div>

            {/* Botão flutuante — só no mobile */}
            {isMobile && <FloatingNewPost onNewPost={handleNewPost} />}
        </div>
    )
}