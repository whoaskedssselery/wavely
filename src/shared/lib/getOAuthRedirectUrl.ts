const OAUTH_CALLBACK_PORT = 53682

const getOAuthRedirectUrl = () =>
	window.electronAPI
		? `http://127.0.0.1:${OAUTH_CALLBACK_PORT}/callback`
		: `${window.location.origin}/`

export default getOAuthRedirectUrl
