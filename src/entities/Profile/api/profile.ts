import type { Profile } from '@/entities/Profile/model/types.ts'
import { CACHE_ONE_YEAR } from '@/shared/api/cache.ts'
import compressImage from '@/shared/lib/compressImage.ts'
import { supabase } from '@/shared/lib/supabase.ts'
import { throwOnError, unwrap } from '@/shared/lib/unwrap.ts'

export const fetchProfile = async (userId: string): Promise<Profile> => {
	const data = await unwrap(supabase.from('profiles').select('*').eq('id', userId))
	return data[0]
}

export const updateUsername = async (userId: string, username: string): Promise<void> => {
	await throwOnError(supabase.from('profiles').update({ username: username }).eq('id', userId))
}

export const updateAvatar = async (
	userId: string,
	avatarFile: File,
	oldAvatarPath: string | null,
): Promise<void> => {
	const compressedAvatar = await compressImage(avatarFile)
	const avatarExtension = compressedAvatar.name.split('.').pop()
	const newAvatarPath = `${userId}/${Date.now()}.${avatarExtension}`

	await throwOnError(
		supabase.storage
			.from('avatars')
			.upload(newAvatarPath, compressedAvatar, { cacheControl: CACHE_ONE_YEAR }),
	)

	const { error: updateError } = await supabase
		.from('profiles')
		.update({ avatar_url: newAvatarPath })
		.eq('id', userId)

	if (updateError) {
		await supabase.storage.from('avatars').remove([newAvatarPath])
		throw updateError
	}

	if (oldAvatarPath) {
		await supabase.storage.from('avatars').remove([oldAvatarPath])
	}
}

export const deleteAccount = async (): Promise<void> => {
	await throwOnError(supabase.rpc('delete_own_account'))
}
