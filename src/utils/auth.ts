const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Parses a JWT token and returns its decoded payload.
 * @param token - The JWT token string.
 * @returns The decoded token payload, or null if the token is invalid.
 */
export function parseJwt(token: string): any {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch {
        return null;
    }
}

/**
 * Wrapper around fetch() that includes Authorization header and handles 401 responses.
 * On 401 (Unauthorized), clears the token and redirects to Google OAuth2 login.
 * @param endpoint - API endpoint path (e.g., '/api/v2/questions').
 * @param options - Fetch options such as method, headers, body, etc.
 * @returns The fetch Response object.
 * @throws An error if the response status is 401.
 */
export async function fetchWithAuth(
    endpoint: string,
    options: RequestInit = {}
): Promise<Response> {
    const token = localStorage.getItem('token');
    const headers = new Headers(options.headers || {});

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
        throw new Error('Unauthorized');
    }

    return response;
}