import {useMemo} from 'react'
import {useSelector} from 'react-redux'

import {useDebounce} from '../utils/hooks.jsx'

/*  Provided a function for converting a search string to a URL,
    returns a search URL based on page-level search that doesn't change too rapidly.
*/
const useSearch = searchToUrl => {
  const search = useDebounce(300,
    useSelector(state=>(
      (state.form.searchInNav && state.form.searchInNav.values)
      ? state.form.searchInNav.values.search
      : ''
    ))
  )
  const endpoint = useMemo(
    ()=>searchToUrl(search),
    [searchToUrl, search]
  )
  return {search, endpoint}
}

export {useSearch}
