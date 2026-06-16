/**
 * apiFetch — helper para chamadas fetch ao backend Laravel.
 *
 * - Lê o token CSRF do cookie automaticamente
 * - Suporta GET, POST, PUT, DELETE
 * - Lança erro com a mensagem do servidor se a resposta não for ok
 * - Usado por: editar post, editar comentário, deletar post, deletar comentário
 */
export async function apiFetch(url, method = 'GET', body = null) {
    // Pega o CSRF token do cookie que o Laravel seta automaticamente
    const csrf = document.cookie
        .split('; ')
        .find(r => r.startsWith('XSRF-TOKEN='))
        ?.split('=')[1]

    const options = {
        method,
        headers: {
            'Content-Type':     'application/json',
            'Accept':           'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN':     csrf ? decodeURIComponent(csrf) : '',
        },
    }

    if (body && method !== 'GET') {
        options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)

    // Tenta ler a resposta como JSON
    let data
    try {
        data = await response.json()
    } catch {
        data = {}
    }

    if (!response.ok) {
        // Pega a mensagem de erro do Laravel (validação, 403, 404 etc.)
        const message =
            data?.message ||
            Object.values(data?.errors || {})?.[0]?.[0] ||
            `Erro ${response.status}`
        throw new Error(message)
    }

    return data
}
