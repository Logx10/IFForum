import { useState } from 'react'
import Navbar from '../Components/Navbar'
import { usePage, router } from '@inertiajs/react'

function Avatar({ name, avatar, size = 40 }) {
    const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'
    const colors = ['#3b5998','#8b5cf6','#059669','#dc2626','#d97706','#0ea5e9','#ec4899']
    const color = colors[name?.charCodeAt(0) % colors.length] || '#3b5998'
    if (avatar) return <img src={avatar} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff' }} />
    return (
        <div style={{ width: size, height: size, borderRadius: '50%', background: color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.35, fontFamily: 'Georgia, serif', border: '3px solid #fff' }}>
            {initials}
        </div>
    )
}

function PostCard({ post }) {
    const preview = post.body?.replace(/\n/g, ' ').slice(0, 200)
    const hasMore = post.body?.length > 200
    return (
        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #dddfe2', marginBottom: 12, overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'box-shadow .2s' }}
            onClick={() => router.visit(`/posts/${post.slug}`)}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.13)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.08)'}
        >
            <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 20, color: '#fff', background: post.category?.color || '#3b5998' }}>
                        {post.category?.icon} {post.category?.name}
                    </span>
                    {post.is_pinned && <span style={{ fontSize: 11, background: '#fff3cd', color: '#856404', borderRadius: 4, padding: '1px 6px', fontWeight: 600 }}>📌 Fixado</span>}
                    <span style={{ fontSize: 12, color: '#65676b', marginLeft: 'auto' }}>{post.last_activity_at}</span>
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: '#1c1e21', fontFamily: 'Georgia, serif', lineHeight: 1.4 }}>
                    {post.title}
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: '#65676b', lineHeight: 1.5 }}>
                    {preview}{hasMore && '...'}
                </p>
                {post.tags?.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                        {post.tags.map(tag => (
                            <span key={tag.id} style={{ fontSize: 11, color: '#3b5998', background: '#e7f0fd', borderRadius: 20, padding: '1px 8px', fontWeight: 600 }}>#{tag.name}</span>
                        ))}
                    </div>
                )}
            </div>
            <div style={{ padding: '8px 16px', borderTop: '1px solid #f0f2f5', display: 'flex', gap: 16 }}>
                {[
                    { icon: '👍', val: post.likes_count },
                    { icon: '💬', val: post.comments_count },
                    { icon: '👁️', val: post.views_count },
                ].map(s => s.val > 0 && (
                    <span key={s.icon} style={{ fontSize: 12, color: '#65676b', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {s.icon} {s.val}
                    </span>
                ))}
            </div>
        </div>
    )
}

export default function Profile() {
    const { user, posts, stats } = usePage().props
    const [activeTab, setActiveTab] = useState('posts')

    const tabs = [
        { key: 'posts',     label: '📝 Posts',      count: stats?.posts_count },
        { key: 'comments',  label: '💬 Comentários', count: stats?.comments_count },
        { key: 'liked',     label: '👍 Curtidos',    count: stats?.liked_count },
    ]

    const roleBadge = {
        admin:     { label: '👑 Admin',       bg: '#fef3c7', color: '#92400e' },
        moderator: { label: '🛡️ Moderador',   bg: '#ede9fe', color: '#5b21b6' },
        user:      { label: '🎓 Estudante',   bg: '#dbeafe', color: '#1e40af' },
    }[user?.role || 'user']

    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
            {/* Navbar */}
            <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#3b5998', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px', height: 50, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={() => router.visit('/')} style={{ background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 6, padding: '6px 12px', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>← Feed</button>
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: 16, fontFamily: 'Georgia, serif' }}>🗣️ IFForum</span>
                </div>
            </div>

            <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 32px' }}>
                {/* Capa e Avatar */}
                <div style={{ background: '#fff', borderRadius: '0 0 12px 12px', border: '1px solid #dddfe2', marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    {/* Banner */}
                    <div style={{ height: 160, background: 'linear-gradient(135deg,#3b5998 0%,#8b5cf6 60%,#ec4899 100%)', position: 'relative' }}>
                        <div style={{ position: 'absolute', bottom: -40, left: 24 }}>
                            <Avatar name={user?.name} avatar={user?.avatar} size={80} />
                        </div>
                    </div>

                    {/* Info */}
                    <div style={{ padding: '48px 24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                        <div>
                            <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#1c1e21', fontFamily: 'Georgia, serif' }}>
                                {user?.name}
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 14, color: '#65676b' }}>@{user?.username}</span>
                                <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: roleBadge.bg, color: roleBadge.color }}>
                                    {roleBadge.label}
                                </span>
                            </div>
                            {user?.bio && <p style={{ margin: '10px 0 0', fontSize: 14, color: '#3e4047', maxWidth: 480, lineHeight: 1.5 }}>{user.bio}</p>}
                            <p style={{ margin: '8px 0 0', fontSize: 13, color: '#65676b' }}>📅 Membro desde {user?.created_at}</p>
                        </div>
                        <button style={{ padding: '8px 20px', borderRadius: 8, border: '1.5px solid #dddfe2', background: '#fff', color: '#1c1e21', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f0f2f5'}
                            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                        >✏️ Editar perfil</button>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', borderTop: '1px solid #f0f2f5' }}>
                        {[
                            { label: 'Posts',       val: stats?.posts_count    || 0 },
                            { label: 'Comentários', val: stats?.comments_count || 0 },
                            { label: 'Curtidas',    val: stats?.liked_count    || 0 },
                        ].map(s => (
                            <div key={s.label} style={{ flex: 1, textAlign: 'center', padding: '14px 0' }}>
                                <div style={{ fontSize: 20, fontWeight: 800, color: '#3b5998', fontFamily: 'Georgia, serif' }}>{s.val}</div>
                                <div style={{ fontSize: 12, color: '#65676b' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                    {/* Feed de posts */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Tabs */}
                        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #dddfe2', marginBottom: 16, display: 'flex', boxShadow: '0 1px 2px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                            {tabs.map(tab => (
                                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ flex: 1, border: 'none', borderBottom: `3px solid ${activeTab === tab.key ? '#3b5998' : 'transparent'}`, background: 'none', padding: '12px 8px', cursor: 'pointer', fontWeight: activeTab === tab.key ? 700 : 400, fontSize: 13, color: activeTab === tab.key ? '#3b5998' : '#65676b', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                    {tab.label}
                                    <span style={{ background: activeTab === tab.key ? '#e7f0fd' : '#f0f2f5', color: activeTab === tab.key ? '#3b5998' : '#65676b', borderRadius: 20, padding: '0 7px', fontSize: 11, fontWeight: 700 }}>{tab.count || 0}</span>
                                </button>
                            ))}
                        </div>

                        {/* Posts */}
                        {activeTab === 'posts' && (
                            posts?.data?.length === 0
                                ? <div style={{ textAlign: 'center', padding: 48, background: '#fff', borderRadius: 8, color: '#65676b' }}><div style={{ fontSize: 40, marginBottom: 8 }}>📝</div><p>Nenhum post ainda.</p></div>
                                : posts?.data?.map(post => <PostCard key={post.id} post={post} />)
                        )}

                        {activeTab === 'comments' && (
                            <div style={{ background: '#fff', borderRadius: 8, padding: 24, textAlign: 'center', color: '#65676b', border: '1px solid #dddfe2' }}>
                                <div style={{ fontSize: 40, marginBottom: 8 }}>💬</div>
                                <p>Histórico de comentários em breve!</p>
                            </div>
                        )}

                        {activeTab === 'liked' && (
                            <div style={{ background: '#fff', borderRadius: 8, padding: 24, textAlign: 'center', color: '#65676b', border: '1px solid #dddfe2' }}>
                                <div style={{ fontSize: 40, marginBottom: 8 }}>👍</div>
                                <p>Posts curtidos em breve!</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar info */}
                    <div style={{ width: 240, flexShrink: 0 }}>
                        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #dddfe2', padding: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
                            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: '#1c1e21', fontFamily: 'Georgia, serif' }}>Sobre</h3>
                            {user?.bio
                                ? <p style={{ fontSize: 13, color: '#65676b', lineHeight: 1.5, margin: '0 0 12px' }}>{user.bio}</p>
                                : <p style={{ fontSize: 13, color: '#65676b', fontStyle: 'italic', margin: '0 0 12px' }}>Sem bio ainda.</p>
                            }
                            <div style={{ fontSize: 13, color: '#65676b', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <span>📅 Membro desde {user?.created_at || '2024'}</span>
                                <span>✉️ {user?.email || '—'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
