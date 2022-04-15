/*  If the first argument is a function, call it by applying the remaining args.
    If the first argument is _not_ a function, simply return it.

    Used by many higher order components that will accept either a value
    or a function to pass props to. See higher-order.jsx in this feature module
    and the ui feature module for examples.
*/
const callIfFunction = (maybeFunction, ...args) =>
  (typeof(maybeFunction) == 'function' ? maybeFunction(...args) : maybeFunction)

/*  Wrap a promise and inject a minimum amount of time before it resolves or rejects.
*/
const delayPromise = (ms, promise) => promise
.then(result=>new Promise((resolve, reject)=>setTimeout(()=>resolve(result), ms)))
.catch(err=>new Promise((resolve, reject)=>setTimeout(()=>reject(err), ms)))

export {callIfFunction, delayPromise}
