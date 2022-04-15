import {useState} from 'react'

/*  Hook for keeping of track of which items in a set are "active",
    which means whatever you want it to, e.g. "expanded", "selected", ...

    Take no arguments, and returns an array that includes:
    - active: array of active values
    - isActive: (val) => bool for whether a given value is active
    - toggleActive: (val) => {...add/remove a value from the active list}
    - toggleAll (all) => {...if active is empty, use "all" for active, otherwise empty out active}
*/
const useTracksActive = () => {
  const [active, setActive] = useState([])

  const isActive = val => active.includes(val)
  const toggleActive = val => setActive(isActive(val) ? active.filter(a=>a!==val) : [...active, val])
  const toggleAll = all => setActive(active.length ? [] : all)

  return [active, isActive, toggleActive, toggleAll]
}

export {useTracksActive}
