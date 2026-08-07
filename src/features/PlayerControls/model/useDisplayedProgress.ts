import { useEffect, useRef, useState } from 'react'

const useDisplayedProgress = (progress: number, isPlaying: boolean) => {
	const [displayed, setDisplayed] = useState(progress)
	const lastSyncRef = useRef({ progress, at: performance.now() })

	useEffect(() => {
		lastSyncRef.current = { progress, at: performance.now() }
		setDisplayed(progress)
	}, [progress])

	useEffect(() => {
		if (!isPlaying) return

		const intervalId = setInterval(() => {
			const { progress: lastProgress, at } = lastSyncRef.current
			setDisplayed(lastProgress + (performance.now() - at) / 1000)
		}, 250)

		return () => clearInterval(intervalId)
	}, [isPlaying])

	return displayed
}

export default useDisplayedProgress
