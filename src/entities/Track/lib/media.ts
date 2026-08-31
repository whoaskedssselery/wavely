export const getAudioDuration = (file: File): Promise<number> => {
	return new Promise((resolve, reject) => {
		const audio = new Audio()
		const fileUrl = URL.createObjectURL(file)
		audio.src = fileUrl

		const finish = (duration: number) => {
			URL.revokeObjectURL(fileUrl)
			resolve(duration)
		}

		audio.addEventListener('loadedmetadata', () => {
			if (Number.isFinite(audio.duration)) {
				finish(audio.duration)
				return
			}

			audio.addEventListener(
				'durationchange',
				() => {
					audio.currentTime = 0
					finish(audio.duration)
				},
				{ once: true },
			)
			audio.currentTime = Number.MAX_SAFE_INTEGER
		})
		audio.addEventListener('error', () => {
			reject(new Error('Не удалось прочитать метаданные аудиофайла'))
			URL.revokeObjectURL(fileUrl)
		})
	})
}
