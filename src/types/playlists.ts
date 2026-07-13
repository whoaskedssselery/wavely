import type { PlaylistForm } from '@/schemas/playlists.ts'

export interface Playlist {
	id: string
	user_id: string
	title: string
	description: string | null
	cover_path: string | null
	created_at: string
}

export interface UploadPlaylistParams {
	data: PlaylistForm
	userId: string
}