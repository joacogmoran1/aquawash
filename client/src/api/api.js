const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:3000';

let _accessToken = null;
let _isRefreshing = false;
let _refreshQueue = [];

export function setAccessToken(token) { _accessToken = token; }
export function clearAccessToken() { _accessToken = null; }

function flushQueue(error, token = null) {
	_refreshQueue.forEach(({ resolve, reject }) =>
		error ? reject(error) : resolve(token)
	);
	_refreshQueue = [];
}

async function doRefresh() {
	const res = await fetch(`${API_BASE}/auth/refresh`, {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
	});
	if (!res.ok) throw new Error('refresh_failed');
	const data = await res.json();
	return data.accessToken;
}

async function request(method, path, body) {
	const headers = { 'Content-Type': 'application/json' };
	if (_accessToken) headers['Authorization'] = `Bearer ${_accessToken}`;

	const res = await fetch(`${API_BASE}${path}`, {
		method,
		credentials: 'include',
		headers,
		...(body !== undefined ? { body: JSON.stringify(body) } : {}),
	});

	const isAuthPath = path.startsWith('/auth/');
	if (res.status === 401 && !isAuthPath) {
		if (_isRefreshing) {
			return new Promise((resolve, reject) => {
				_refreshQueue.push({ resolve, reject });
			}).then(() => request(method, path, body));
		}

		_isRefreshing = true;

		try {
			const newToken = await doRefresh();
			_accessToken = newToken;
			flushQueue(null, newToken);
			return request(method, path, body);
		} catch {
			flushQueue(new Error('session_expired'));
			_accessToken = null;
			window.dispatchEvent(new CustomEvent('auth:session_expired'));
			throw new Error('Tu sesión expiró. Por favor iniciá sesión nuevamente.');
		} finally {
			_isRefreshing = false;
		}
	}

	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
	return data;
}

const api = {
	get: (path) => request('GET', path),
	post: (path, body) => request('POST', path, body),
	put: (path, body) => request('PUT', path, body),
	delete: (path) => request('DELETE', path),
};

export default api;