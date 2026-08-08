import { motion } from 'framer-motion'
import './SplashOverlay.scss'

const BARS = [
	{ x: 6, height: 18 },
	{ x: 20, height: 30 },
	{ x: 34, height: 24 },
]

const BASELINE = 42

const SplashOverlay = () => (
	<div className="splash-overlay">
		<svg
			className="splash-overlay__logo"
			aria-hidden="true"
			width="140"
			height="140"
			viewBox="0 0 48 48"
		>
			{BARS.map((bar, index) => (
				<motion.rect
					key={bar.x}
					x={bar.x}
					width={8}
					rx={2}
					fill="currentColor"
					initial={{ height: bar.height * 0.4, y: BASELINE - bar.height * 0.4 }}
					animate={{
						height: [bar.height * 0.4, bar.height, bar.height * 0.4],
						y: [
							BASELINE - bar.height * 0.4,
							BASELINE - bar.height,
							BASELINE - bar.height * 0.4,
						],
					}}
					transition={{
						duration: 0.9,
						repeat: Number.POSITIVE_INFINITY,
						ease: 'easeInOut',
						delay: index * 0.12,
					}}
				/>
			))}
		</svg>
	</div>
)

export default SplashOverlay
