import { useState } from 'react'
import { usePage } from '@inertiajs/react'

/**
 * useLike — curte/descurte com Optimistic UI + fetch real ao banco.
 *
 * Fluxo:
 *   1. Atualiza estado visual imediatamente (sem esperar o servidor)
 *   2. Faz POST /likes/{type}/{id} em background via fetch()
 *   3. Confirma com o valor real retornado pelo servidor
 *   4. Em caso de erro, reverte ao estado anterior
 *
 * @param {'post'|'comment'} type
 * @param {number}  id
 * @param {boolean} initLiked  — vem de post.is_liked ou comment.is_liked
 * @param {number}  initCount  — vem de post.likes_count ou comment.likes_count
 */
export function useLike(type, id, initLiked = false, initCount = 0) {
    const { auth } = usePage().props
    const [liked,      setLiked]      = useState(initLiked)
    const [likesCount, setLikesCount] = useState(initCount)
    const [loading,    setLoading]    = useState(false)

    async function toggle(e) {
        e?.stopPropagation()

        // Visitante → redireciona para login
        if (!auth?.user) {
            window.location.href = '/login'
            return
        }

        if (loading) return
        setLoading(true)

        // Guarda estado anterior para rollback
        const prevLiked = liked
        const prevCount = likesCount

        // Optimistic: atualiza tela antes da resposta
        setLiked(l => !l)
        setLikesCount(c => prevLiked ? c - 1 : c + 1)

        try {
            // Pega token CSRF do cookie do Laravel
            const csrf = document.cookie
                .split('; ')
                .find(r => r.startsWith('XSRF-TOKEN='))
                ?.split('=')[1]

            const res = await fetch(`/likes/${type}/${id}`, {
                method:  'POST',
                headers: {
                    'Content-Type':     'application/json',
                    'Accept':           'application/json',
                    'X-XSRF-TOKEN':     csrf ? decodeURIComponent(csrf) : '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            })

            if (!res.ok) throw new Error(`HTTP ${res.status}`)

            // Sincroniza com valor real do servidor
            const data = await res.json()
            setLiked(data.liked)
            setLikesCount(data.likes_count)

        } catch (err) {
            // Rollback em caso de erro
            console.error('[useLike] erro:', err)
            setLiked(prevLiked)
            setLikesCount(prevCount)
        } finally {
            setLoading(false)
        }
    }

    return { liked, likesCount, toggle, loading }
}
