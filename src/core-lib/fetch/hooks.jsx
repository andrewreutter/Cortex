import fetchOK from './functions.jsx'
import {useEffect, useMemo} from 'react'

import {useMakePromise} from '../utils/hooks.jsx'

/*  Return a fetch function whose identity only changes when url or options changes.
*/
const useFetchMemo = (url, options) => (
  useMemo(()=>{
    return () => fetchOK(url, options)
  }, [url, options])
)

/*  Hook for calling fetch() ala functions.jsx from client code.

    Arguments:
    - fetchId: unique ID for this fetch.

    Returns an object with properties:

    - fetch: a function with the same signature as fetch() from functions.jsx
    - fetching: boolean for whether a fetch is in flight.
    - ready: boolean indicating whether the fetch has completed.
    - response: the XHR response, or null if fetch() is in flight or errored out.
    - error: error instance, using error semantics of fetchOK(), or null if in flight or successful.
*/
const useFetch = (url, options) => {
  const fetch = useFetchMemo(url, options)
  const {makePromise, ready, busy, result, error} = useMakePromise(fetch)
  return {fetch:makePromise, fetching:busy, ready, response:result, error}
}

/*  useFetches(url, options) hook calls fetch on first render, then whenever url or options changes.

    Arguments:

      - url: URL to fetch()
      - fetchOptions: an object to pass as the second argument to fetch().
        If this is static, make sure to lift it out of the calling function
        so that identify changes don't trigger over-eager fetches.

    Returns the same values as useFetch(), except that fetch() requires no arguments
    because it uses the url and options passed to useFetches(). Can be used for retries.
*/
const useFetches = (url, options) => {
  const {fetch, ...ret} = useFetch(url, options)
  useEffect(()=>{
    fetch()
  }, [fetch])
  return {fetch, ...ret}
}

/*  Use an API reponse that is structured ala jsonapi: https://jsonapi.org/

    Arguments:
    - response: a fetch() response object.

    Returns the .data found in the response, with the relationships de-referenced
    using the .includes.
*/
const useJsonApiResponse = response => {
  const responseData = useMemo(()=>(
    (response || {}).data || {data:[], included:[]}
  ), [response])

  // Make a lookup {type:{id:object}} for the "included" member of the response.
  const responseItems = useMemo(()=>{
    const includedByTypeThenId = (responseData.included || []).reduce(
      (prev, included) => ({
        ...prev,
        [included.type]: ({
          ...(prev[included.type] || {}),
          [included.id]: included,
        }),
      }),
      {}
    )
    const items = responseData.data.map(
      ({id, type, relationships={}, ...datum})=>({
        id, type, ...datum, // e.g. assignments, links
        relationships: Object.entries(relationships).reduce(
          (prev, [relName, {links, data}]) => {
            const {id, type} = data
            const {attributes={}} = includedByTypeThenId[type][id]
            return ({
              ...prev,
              [relName]: {id, type, links, attributes}
            })
          }, {}
        ),
      })
    )
    return items
  }, [responseData])

  const responseItemIds = useMemo(
    () => responseItems.map(d=>d.id),
    [responseItems],
  )

  return {responseData, responseItems, responseItemIds}
}

export {useJsonApiResponse, useFetch, useFetches}
