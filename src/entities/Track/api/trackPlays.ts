import type { FavoriteTrack, PlayableTrack } from '@/entities/Track/model/types.ts'
import { supabase } from '@/shared/lib/supabase.ts'

export const recordTrackPlay = async (track: PlayableTrack): Promise<void> => {
	const { error } = await supabase.rpc('record_track_play', {
		p_audio_path: track.audio_path,
		p_title: track.title,
		p_artist: track.artist,
		p_cover_path: track.cover_path,
	})

	if (error) {
		throw error
	}
}

export const fetchFavoriteTrack = async (userId: string): Promise<FavoriteTrack | null> => {
	const { data, error } = await supabase
		.from('track_play_counts')
		.select('audio_path, title, artist, cover_path, play_count')
		.eq('user_id', userId)
		.order('play_count', { ascending: false })
		.order('last_played_at', { ascending: false })
		.limit(1)
		.maybeSingle()

	if (error) {
		throw error
	}

	return data
}
