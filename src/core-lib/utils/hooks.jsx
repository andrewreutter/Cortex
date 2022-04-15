import {createRef, useState, useEffect, useRef, useMemo} from 'react'
import classNames from 'classnames'

/*  Slow the rate of change for a rapidly-changing value.

    Arguments:
    - ms: the value returned will only change once the source value
      has stopped changing for the provided number of milliseconds.
    - val: the rapidly changing value.

    Returns:
    - debouncedValue: a value that only changing on the frequency described above.
*/
const useDebounce = (ms, val) => {
  const [debouncedValue, setDebouncedValue] = useState(val)
  const [debounceTimeout, setDebounceTimeout] = useState()
  const dtRef = useRef(debounceTimeout);
  dtRef.current = debounceTimeout;

  useEffect(()=>{
    const newTimeout = setTimeout(()=>{
      if (newTimeout === dtRef.current )
        setDebouncedValue(val);
    }, ms)
    setDebounceTimeout(newTimeout)
  }, [ms, val])

  return debouncedValue
}

/*  Combine a class or classes with the className (if any) prop passed in.
    Supports all values that work with the classnames npm module, such as a string, key:boolean objects, etc...

    Usage example:

      const NewComponent = addsClassNames('red')(OldComponent)
      <NewComponent/> is now equivalent to <OldComponent className="red"/>
      <NewComponent className="wide"/> is now equivalent to <OldComponent className="red wide"/>
*/
const useClassNames = (c1, c2, c3, c4, c5) => useMemo(()=>{ // TODO DEBT: use everywhere and kill addsClassNames()?
  return classNames(c1, c2, c3, c4, c5)
}, [c1, c2, c3, c4, c5])

/*  Hook for working with async, promise-based operations.

    Arguments:
    - promiseMaker: () => Promise. NOTE: limit identity changes as much as possible.

    Returns an object with members:
    - makePromise: () => Promise. Call this instead of your promiseMaker for tracking justice.
      If you call it while we're waiting for the _last_ promise, we'll ignore the last promise's results.
    - ready: have we resolved or rejected a promise at least once?
    - busy: are we currently waiting for a promise to complete?
    - result: promise resolution, if any. If present, error will be null.
    - error: promise rejection, if any. If present, result will be null.
*/
const useMakePromise = promiseMaker => {

  const [[result, error, ready], setPromiseResult] = useState([null, null, false])
  const [busy, setBusy] = useState(false)

  const [promiseMade, setPromiseMade] = useState()
  const promiseMadeRef = useRef(promiseMade)
  promiseMadeRef.current = promiseMade
  const setIfMostRecent = (thePromise, res, err) => {
    if (thePromise === promiseMadeRef.current)
      setPromiseResult([res, err, true])
      setBusy(false)
  }

  const makePromise = useMemo(()=>{
    return (clearState) => {
      const thePromise = promiseMaker()

      thePromise
      .then(resolved=>setIfMostRecent(thePromise, resolved, null))
      .catch(rejected=>setIfMostRecent(thePromise, null, rejected))

      if (clearState) setPromiseResult([null, null, false])
      setPromiseMade(thePromise)
      setBusy(true)
      return thePromise
    }
  }, [promiseMaker])

  return {makePromise, ready, busy, result, error}
}

/*  Like useMakePromise(), except also calls the promiseMaker whenever its identity changes.
*/
const useMakesPromise = promiseMaker => {
  const {makePromise, ...ret} = useMakePromise(promiseMaker)
  useEffect(()=>{
    makePromise()
  }, [makePromise])
  return {makePromise, ...ret}
}

/*  Hook for interacting with native DOM elements. Usage:

      const [ref, node] = useNode()
      if (node) console.log('node:', node)  // node is undefined until after first render.
      return <div ref={ref}/>               // use ref={ref} or node will always remain undefined!
*/
const useNode = () => {
  const ref = useMemo(()=>createRef(), []) // create the ref once and only once
  const current = ref.current
  const [node, setNode] = useState()
  useEffect(()=>{
    setNode(current)
  }, [current])
  return [ref, node]
}

export {
  useDebounce,
  useClassNames,
  useMakePromise, useMakesPromise,
  useNode,
}
