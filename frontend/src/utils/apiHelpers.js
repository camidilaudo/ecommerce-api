/**
 * Manejo común de respuestas fetch / APIs
 * Devuelve el body (JSON o texto) o lanza Error con mensaje extraído.
 */

export async function handleApiResponse(response) {
    const contentType = response.headers.get('content-type') || '';
    let body;
    if (contentType.includes('application/json')) {
        try {
            body = await response.json();
        } catch (e) {
            body = null;
        }
    } else {
        try {
            body = await response.text();
        } catch (e) {
            body = null;
        }
    }

    if (!response.ok) {
        // Extraemos un mensaje legible
        const message = (body && (body.message || body.error || JSON.stringify(body))) || `HTTP ${response.status}`;
        const err = new Error(message);
        err.status = response.status;
        err.body = body;
        throw err;
    }

    return body;
}