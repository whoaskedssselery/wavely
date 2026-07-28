export const getAudioDuration = (file: File): Promise<number> => {
	return new Promise((resolve, reject) => {
		const audio = new Audio()
		const fileUrl = URL.createObjectURL(file)
		audio.src = fileUrl
		audio.addEventListener('loadedmetadata', () => {
			URL.revokeObjectURL(fileUrl)
			resolve(audio.duration)
		})
		audio.addEventListener('error', () => {
			reject(new Error('Не удалось прочитать метаданные аудиофайла'))
			URL.revokeObjectURL(fileUrl)
		})
	})
}
