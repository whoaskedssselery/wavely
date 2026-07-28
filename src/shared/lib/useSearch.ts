import { useState } from 'react'

const useSearch = <T>(
	items: T[] | undefined,
	getFields: (item: T) => (string | null | undefined)[],
) => {
	const [searchQuery, setSearchQuery] = useState('')

	const query = searchQuery.trim().toLowerCase()

	const filteredItems = query
		? items?.filter((item) => getFields(item).some((field) => field?.toLowerCase().includes(query)))
		: items

	return { searchQuery, setSearchQuery, filteredItems }
}

export default useSearch
