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
	data: {
		title: string
		artist: string
		audioFile: FileList
		coverFile?: FileList
	}
	userId: string
}

export interface FavoriteTrack {
	audio_path: string
	title: string
	artist: string
	cover_path: string | null
	play_count: number
}
