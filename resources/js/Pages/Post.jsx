import { useState, useRef } from 'react'
import Navbar from '../Components/Navbar'
import { usePage, router } from '@inertiajs/react'

function Avatar({ name, avatar, size = 40 }) {
    const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??'
    const colors = ['#3b5998','#8b5cf6','#059669','#dc2626','#d97706','#0ea5e9','#ec4899']
    const color = colors[name?.charCodeAt(0) % colors.length] || '#3b5998'
    if (avatar) return <img src={avatar} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
    return (
        <div style={{ width: size, height: size, borderRadius: '50%', background: color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: size * 0.35, fontFamily: 'Georgia, serif' }}>
            {initials}
        </div>
    )
}

function Comment({ comment, depth = 0 }) {
    const [liked, setLiked]           = useState(comment.is_liked || false)
    const [likesCount, setLikesCount] = useState(comment.likes_count || 0)
    const [showReply, setShowReply]   = useState(false)
    const [replyText, setReplyText]   = useState('')
    const [replying, setReplying]     = useState(false)

    function handleLike() {
        setLiked(l => !l)
        setLikesCount(c => liked ? c - 1 : c + 1)
    }

    function handleReply(e) {
        e.preventDefault()
        if (!replyText.trim() || replyText.length < 3) return
        setReplying(true)
        router.post(`/posts/${comment.post_id}/comments`, { body: replyText, parent_id: comment.id }, {
            onSuccess: () => { setReplyText(''); setShowReply(false); setReplying(false) },
            onError:   ()  => setReplying(false),
        })
    }

    return (
        <div style={{ marginLeft: depth > 0 ? 48 : 0, marginTop: 12 }}>
            <div style={{ display: 'flex', gap: 10 }}>
                <Avatar name={comment.author?.name} avatar={comment.author?.avatar} size={depth === 0 ? 38 : 30} />
                <div style={{ flex: 1 }}>
                    {/* Balão do comentário */}
                    <div style={{ background: '#f0f2f5', borderRadius: 12, padding: '10px 14px', display: 'inline-block', maxWidth: '100%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 700, fontSize: 13, color: '#1c1e21' }}>{comment.author?.name}</span>
                            {comment.is_solution && (
                                <span style={{ fontSize: 11, background: '#d1fae5', color: '#065f46', borderRadius: 4, padding: '1px 6px', fontWeight: 600 }}>✅ Solução</span>
                            )}
                        </div>
                        <p style={{ margin: 0, fontSize: 14, color: '#1c1e21', lineHeight: 1.5 }}>{comment.body}</p>
                    </div>

                    {/* Ações do comentário */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, padding: '0 4px' }}>
                        <span style={{ fontSize: 12, color: '#65676b' }}>{comment.created_at}</span>
                        <button onClick={handleLike} style={{ background: 'none', border: 'none', fontSize: 12, fontWeight: 700, color: liked ? '#3b5998' : '#65676b', cursor: 'pointer', padding: 0 }}>
                            👍 {liked ? 'Curtido' : 'Curtir'}{likesCount > 0 && ` · ${likesCount}`}
                        </button>
                        {depth === 0 && (
                            <button onClick={() => setShowReply(s => !s)} style={{ background: 'none', border: 'none', fontSize: 12, fontWeight: 700, color: '#65676b', cursor: 'pointer', padding: 0 }}>
                                💬 Responder
                            </button>
                        )}
                    </div>

                    {/* Caixa de resposta */}
                    {showReply && (
                        <form onSubmit={handleReply} style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'flex-start' }}>
                            <textarea value={replyText} rows={2} placeholder="Escreva uma resposta..."
                                onChange={e => setReplyText(e.target.value)}
                                style={{ flex: 1, padding: '8px 12px', borderRadius: 20, border: '1.5px solid #dddfe2', outline: 'none', fontSize: 13, fontFamily: 'inherit', resize: 'none', lineHeight: 1.4 }}
                                onFocus={e => e.target.style.borderColor = '#3b5998'}
                                onBlur={e => e.target.style.borderColor = '#dddfe2'}
                            />
                            <button type="submit" disabled={replying} style={{ padding: '8px 16px', borderRadius: 20, border: 'none', background: '#3b5998', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer', flexShrink: 0 }}>
                                {replying ? '...' : '↑'}
                            </button>
                        </form>
                    )}

                    {/* Respostas aninhadas */}
                    {comment.replies?.map(reply => (
                        <Comment key={reply.id} comment={reply} depth={depth + 1} />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function Post() {
    const { post, comments: initialComments } = usePage().props
    const [liked, setLiked]           = useState(post.is_liked || false)
    const [likesCount, setLikesCount] = useState(post.likes_count || 0)
    const [commentText, setCommentText] = useState('')
    const [commenting, setCommenting] = useState(false)
    const commentRef = useRef(null)

    function handleLike() {
        setLiked(l => !l)
        setLikesCount(c => liked ? c - 1 : c + 1)
    }

    function handleComment(e) {
        e.preventDefault()
        if (!commentText.trim() || commentText.length < 3) return
        setCommenting(true)
        router.post(`/posts/${post.id}/comments`, { body: commentText }, {
            onSuccess: () => { setCommentText(''); setCommenting(false) },
            onError:   ()  => setCommenting(false),
        })
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Helvetica Neue, Arial, sans-serif' }}>
            {/* Navbar */}
            <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#3b5998', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px', height: 50, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={() => router.visit('/')} style={{ background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 6, padding: '6px 12px', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                        ← Voltar
                    </button>
                    <span style={{ color: '#fff', fontWeight: 800, fontSize: 16, fontFamily: 'Georgia, serif', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        🗣️ IFForum
                    </span>
                </div>
            </div>

            <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 16px' }}>
                {/* Card do post */}
                <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #dddfe2', marginBottom: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    {/* Header */}
                    <div style={{ padding: '16px 20px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Avatar name={post.author?.name} avatar={post.author?.avatar} size={48} />
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 700, fontSize: 15, color: '#1c1e21', fontFamily: 'Georgia, serif' }}>{post.author?.name}</span>
                                <span style={{ fontSize: 12, background: post.category?.color || '#3b5998', color: '#fff', borderRadius: 20, padding: '1px 10px', fontWeight: 600 }}>
                                    {post.category?.icon} {post.category?.name}
                                </span>
                            </div>
                            <span style={{ fontSize: 12, color: '#65676b' }}>{post.last_activity_at} · {post.views_count} visualizações</span>
                        </div>
                    </div>

                    {/* Título */}
                    <div style={{ padding: '14px 20px 8px' }}>
                        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1c1e21', fontFamily: 'Georgia, serif', lineHeight: 1.4 }}>
                            {post.title}
                        </h1>
                    </div>

                    {/* Tags */}
                    {post.tags?.length > 0 && (
                        <div style={{ padding: '0 20px 10px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {post.tags.map(tag => (
                                <span key={tag.id} style={{ fontSize: 12, color: '#3b5998', background: '#e7f0fd', borderRadius: 20, padding: '2px 10px', fontWeight: 600 }}>#{tag.name}</span>
                            ))}
                        </div>
                    )}

                    {/* Corpo */}
                    <div style={{ padding: '4px 20px 16px' }}>
                        {post.body?.split('\n').map((line, i) => (
                            <p key={i} style={{ margin: '0 0 12px', fontSize: 15, color: '#1c1e21', lineHeight: 1.7 }}>{line}</p>
                        ))}
                    </div>

                    {/* Contadores */}
                    <div style={{ padding: '8px 20px', borderTop: '1px solid #f0f2f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, color: '#65676b', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {likesCount > 0 && <><span>👍</span> {likesCount} curtida{likesCount > 1 ? 's' : ''}</>}
                        </span>
                        <span style={{ fontSize: 13, color: '#65676b' }}>
                            {post.comments_count} comentário{post.comments_count !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Botões */}
                    <div style={{ display: 'flex', borderTop: '1px solid #dddfe2' }}>
                        {[
                            { icon: '👍', label: liked ? 'Curtido' : 'Curtir', action: handleLike, active: liked },
                            { icon: '💬', label: 'Comentar', action: () => commentRef.current?.focus() },
                            { icon: '↗️', label: 'Compartilhar', action: () => {} },
                        ].map(btn => (
                            <button key={btn.label} onClick={btn.action} style={{ flex: 1, border: 'none', background: 'none', padding: '10px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: btn.active ? '#3b5998' : '#65676b', transition: 'background .15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f0f2f5'}
                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                                <span style={{ fontSize: 16 }}>{btn.icon}</span>{btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Seção de comentários */}
                <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #dddfe2', padding: 20, boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#1c1e21', fontFamily: 'Georgia, serif' }}>
                        💬 {post.comments_count} comentário{post.comments_count !== 1 ? 's' : ''}
                    </h3>

                    {/* Caixa de novo comentário */}
                    <form onSubmit={handleComment} style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'flex-start' }}>
                        <Avatar name="Você" size={38} />
                        <div style={{ flex: 1 }}>
                            <textarea ref={commentRef} value={commentText} rows={3}
                                placeholder="Escreva um comentário..."
                                onChange={e => setCommentText(e.target.value)}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: 20, border: '1.5px solid #dddfe2', outline: 'none', fontSize: 14, fontFamily: 'inherit', resize: 'none', lineHeight: 1.5, boxSizing: 'border-box' }}
                                onFocus={e => e.target.style.borderColor = '#3b5998'}
                                onBlur={e => e.target.style.borderColor = '#dddfe2'}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                                <button type="submit" disabled={commenting || commentText.length < 3} style={{ padding: '8px 20px', borderRadius: 20, border: 'none', background: commenting || commentText.length < 3 ? '#93acd8' : '#3b5998', color: '#fff', fontWeight: 600, fontSize: 13, cursor: commenting || commentText.length < 3 ? 'not-allowed' : 'pointer' }}>
                                    {commenting ? 'Enviando...' : '📢 Comentar'}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Lista de comentários */}
                    {initialComments?.data?.length === 0
                        ? <div style={{ textAlign: 'center', padding: '30px 0', color: '#65676b' }}><div style={{ fontSize: 40, marginBottom: 8 }}>💬</div><p style={{ margin: 0 }}>Seja o primeiro a comentar!</p></div>
                        : initialComments?.data?.map(comment => <Comment key={comment.id} comment={comment} />)
                    }
                </div>
            </div>
        </div>
    )
}
