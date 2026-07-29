const MAX_SIDE = 800
const QUALITY = 0.85

const compressImage = async (file: File): Promise<File> => {
	if (!file.type.startsWith('image/')) return file

	try {
		const bitmap = await createImageBitmap(file)
		const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
		const width = Math.round(bitmap.width * scale)
		const height = Math.round(bitmap.height * scale)

		const canvas = document.createElement('canvas')
		canvas.width = width
		canvas.height = height

		const context = canvas.getContext('2d')
		if (!context) return file

		context.imageSmoothingEnabled = true
		context.imageSmoothingQuality = 'high'
		context.drawImage(bitmap, 0, 0, width, height)
		bitmap.close()

		const blob = await new Promise<Blob | null>((resolve) => {
			canvas.toBlob(resolve, 'image/webp', QUALITY)
		})

		if (!blob || blob.size >= file.size) return file

		return new File([blob], 'cover.webp', { type: 'image/webp' })
	} catch {
		return file
	}
}

export default compressImage
