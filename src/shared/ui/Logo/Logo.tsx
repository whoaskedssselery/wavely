import './Logo.scss'

interface LogoProps {
	withLabel?: boolean
	className?: string
}

const Logo = ({ withLabel = true, className }: LogoProps) => {
	return (
		<span className={`logo ${className ?? ''}`}>
			<svg aria-hidden="true" width="30" height="30" viewBox="0 0 24 24" fill="none">
				<rect x="3" y="12" width="4" height="9" rx="1" fill="currentColor" />
				<rect x="10" y="6" width="4" height="15" rx="1" fill="currentColor" />
				<rect x="17" y="9" width="4" height="12" rx="1" fill="currentColor" />
			</svg>
			{withLabel && <span>Wavely</span>}
		</span>
	)
}

export default Logo
