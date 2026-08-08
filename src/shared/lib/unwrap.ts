interface Result<T> {
	data: T | null
	error: { message: string } | null
}

export const unwrap = async <T>(query: PromiseLike<Result<T>>): Promise<T> => {
	const { data, error } = await query

	if (error) {
		throw error
	}

	return data as T
}

export const throwOnError = async (
	query: PromiseLike<{ error: { message: string } | null }>,
): Promise<void> => {
	const { error } = await query

	if (error) {
		throw error
	}
}
