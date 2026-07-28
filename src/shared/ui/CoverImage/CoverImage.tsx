import { supabase } from '@/shared/lib/supabase.ts'

interface CoverImageProps {
	coverPath: string | null
	alt: string
	className: string
	kind: 'track' | 'playlist'
}

const CoverImage = (props: CoverImageProps) => {
	const { coverPath, alt, className, kind } = props

	if (coverPath) {
		return (
			<img
				className={className}
				src={supabase.storage.from('covers').getPublicUrl(coverPath).data.publicUrl}
				alt={alt}
				loading="lazy"
				decoding="async"
			/>
		)
	}

	if (kind === 'track') {
		return (
			<svg
				aria-hidden="true"
				className={`${className} ${className}--placeholder`}
				viewBox="0 0 24 24"
				fill="none"
			>
				<circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.15" />
				<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
				<circle cx="12" cy="12" r="3" fill="currentColor" />
			</svg>
		)
	}

	return (
		<svg
			aria-hidden="true"
			className={`${className} ${className}--placeholder`}
			viewBox="0 0 24 24"
			fill="none"
		>
			<path
				d="M9 18V5l10-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm10-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	)
}

export default CoverImage
