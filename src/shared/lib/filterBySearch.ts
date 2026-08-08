export const filterBySearch = <T>(
	items: T[] | undefined,
	query: string,
	getFields: (item: T) => (string | null | undefined)[],
): T[] | undefined => {
	const normalizedQuery = query.trim().toLowerCase()

	if (!normalizedQuery) return items

	return items?.filter((item) =>
		getFields(item).some((field) => field?.toLowerCase().includes(normalizedQuery)),
	)
}
