import {delayPromise} from '../utils/functions.jsx'

/* Custom error for fetchOK */
class FetchError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

/*  fetchOK: Just like fetch(), with the following changes:
    - will reject on non-20X responses
    - all errors are FetchError objects with both .message and .status
      status will be an HTTP response code (e.g. 404) or -1 for network failures.
    - if a delay property is provided an as option, it is a number of milliseconds delay
      to inject before resolving or rejecting the promise. Can be useful during development.
    - if a bodyJSON property is provided as an option, it will be passed through
      JSON.stringify and used as the body option, and the headers option will be extended
      with Content-Type:application/json
    - if parseJSON:true is provided as an option, successful responses will include a data
      property which is the result of calling response.json(). If the value for parseJSON
      is a function, the data will be passed through that function before data is returned.
*/
const fetchOK = (url, options) => {
  let {bodyJSON, parseJSON, mockData, delay=0, ...finalOptions} = options
  if (bodyJSON) {
    finalOptions = {
      ...finalOptions,
      body: JSON.stringify(bodyJSON),
      headers: {
        ...(finalOptions.headers || {}), // retain provided headers
        'Content-Type': 'application/json'
      }
    }
  }
  return delayPromise(delay,
    fetch(url, finalOptions)
    .then(response=>{
      if (!response.ok) throw new FetchError(response.statusText, response.status)
      if (mockData) {
        response.data = mockData()
      } else {
        if (typeof(parseJSON) === 'function') {
          response.data = parseJSON(response.json())
        } else if (parseJSON) {
          response.data = response.json()
        }
      }
      return response
    })
    .catch(err=>{
      let errorMessage = err.message
      if (!err.status) {
        errorMessage = 'Network failure'
      } else if (!errorMessage) {
        errorMessage = { // Fill in some common HTTP failures in case server doesn't return statusText.
          404: 'Not found',
        }[err.status] || `Error ${err.status}`
      }
      throw new FetchError(errorMessage, err.status || -1) // network failures don't have status
    })
  )
}

export default fetchOK
export {fetchOK as fetch, FetchError}
