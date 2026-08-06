const getOAuthRedirectUrl = () =>
	window.electronAPI ? 'wavely://auth-callback' : `${window.location.origin}/`

export default getOAuthRedirectUrl
