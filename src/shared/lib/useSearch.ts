import { useState } from 'react'
import { filterBySearch } from '@/shared/lib/filterBySearch.ts'

const useSearch = <T>(
	items: T[] | undefined,
	getFields: (item: T) => (string | null | undefined)[],
) => {
	const [searchQuery, setSearchQuery] = useState('')

	const filteredItems = filterBySearch(items, searchQuery, getFields)

	return { searchQuery, setSearchQuery, filteredItems }
}

export default useSearch
