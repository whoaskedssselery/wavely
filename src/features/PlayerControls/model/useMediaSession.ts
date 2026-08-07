import { useEffect } from 'react'
import { usePlayerStore } from '@/features/PlayerControls/model/playerStore.ts'
import { supabase } from '@/shared/lib/supabase.ts'

const useMediaSession = () => {
	const { currentTrack, isPlaying, progress, setIsPlaying, playNext, playPrev, seekTo } =
		usePlayerStore()

	useEffect(() => {
		if (!('mediaSession' in navigator)) return

		if (!currentTrack) {
			navigator.mediaSession.metadata = null
			return
		}

		const coverPath = currentTrack.cover_path
		const coverUrl = coverPath?.startsWith('http')
			? coverPath
			: coverPath
				? supabase.storage.from('covers').getPublicUrl(coverPath).data.publicUrl
				: null

		navigator.mediaSession.metadata = new MediaMetadata({
			title: currentTrack.title,
			artist: currentTrack.artist,
			artwork: coverUrl ? [{ src: coverUrl, sizes: '512x512' }] : [],
		})
	}, [currentTrack])

	useEffect(() => {
		if (!('mediaSession' in navigator)) return
		navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
	}, [isPlaying])

	useEffect(() => {
		if (!('mediaSession' in navigator)) return

		const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
			['play', () => setIsPlaying(true)],
			['pause', () => setIsPlaying(false)],
			['nexttrack', () => playNext(true)],
			['previoustrack', () => playPrev()],
			[
				'seekto',
				(details) => {
					if (typeof details.seekTime === 'number') seekTo(details.seekTime)
				},
			],
		]

		for (const [action, handler] of handlers) {
			try {
				navigator.mediaSession.setActionHandler(action, handler)
			} catch {}
		}

		return () => {
			for (const [action] of handlers) {
				try {
					navigator.mediaSession.setActionHandler(action, null)
				} catch {}
			}
		}
	}, [setIsPlaying, playNext, playPrev, seekTo])

	useEffect(() => {
		if (!('mediaSession' in navigator) || !navigator.mediaSession.setPositionState) return

		const duration = currentTrack?.duration
		if (!duration) return

		try {
			navigator.mediaSession.setPositionState({
				duration,
				position: Math.min(Math.max(progress, 0), duration),
				playbackRate: 1,
			})
		} catch {}
	}, [currentTrack, progress])
}

export default useMediaSession
