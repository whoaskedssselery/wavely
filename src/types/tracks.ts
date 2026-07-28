import type { TrackForm } from '@/schemas/tracks.ts'

export interface Track {
	id: string
	user_id: string
	title: string
	artist: string
	duration: number | null
	audio_path: string
	cover_path: string | null
	created_at: string
}

export interface PlayableTrack {
	id: string
	title: string
	artist: string
	duration: number | null
	audio_path: string
	cover_path: string | null
	position?: number
}

export interface UploadTrackParams {
	data: TrackForm
	userId: string
}
