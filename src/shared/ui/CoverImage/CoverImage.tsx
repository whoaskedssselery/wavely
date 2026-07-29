import { supabase } from '@/shared/lib/supabase.ts'

interface CoverImageProps {
	coverPath: string | null
	alt: string
	className: string
	kind: 'track' | 'playlist' | 'profile'
	bucket?: 'covers' | 'avatars'
	priority?: boolean
}

const CoverImage = (props: CoverImageProps) => {
	const { coverPath, alt, className, kind, bucket = 'covers', priority } = props

	if (coverPath) {
		const src = coverPath.startsWith('http')
			? coverPath
			: supabase.storage.from(bucket).getPublicUrl(coverPath).data.publicUrl

		return (
			<img
				className={className}
				src={src}
				alt={alt}
				loading="eager"
				fetchPriority={priority ? 'high' : 'low'}
				decoding="async"
			/>
		)
	}

	if (kind === 'profile') {
		return (
			<svg
				aria-hidden="true"
				className={`${className} ${className}--placeholder`}
				viewBox="0 0 24 24"
				fill="none"
			>
				<circle cx="12" cy="8" r="4" fill="currentColor" />
				<path
					d="M4 20c0-3.5 3.5-6 8-6s8 2.5 8 6"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
				/>
			</svg>
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
