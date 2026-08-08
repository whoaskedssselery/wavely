export interface Playlist {
	id: string
	user_id: string
	title: string
	description: string | null
	author: string | null
	cover_path: string | null
	created_at: string
}

export interface PlaylistTrack {
	id: string
	playlist_id: string
	title: string
	artist: string
	duration: number | null
	audio_path: string
	cover_path: string | null
	position: number
	added_at: string
}

export interface UploadPlaylistParams {
	data: {
		title: string
		description?: string
		author?: string
		coverFile?: FileList
	}
	userId: string
}
