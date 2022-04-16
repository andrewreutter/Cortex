import {useMemo} from 'react'
import {SubmissionError} from 'redux-form'
import Cookies from 'universal-cookie';
//import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';

import {useFetch, useFetches} from '../../core-lib/fetch/hooks.jsx'

const cookies = new Cookies(); // TODO AUTH: remove once we're talking to a real auth API
const username = cookies.get('username')
const fullname = cookies.get('fullname')

/*  useAuth(): hook that fetches data about the current user. Returns an object with properties:

    - ready: false until we know whether the user is authenticated.
    - error: FetchError instance, if any.
    - isAuthenticated: true if the user is signed in.
    - routes: an array of path strings that the user is authorized to use
    - user: null if not authenticated; if authenticated, an object with properties:
      - username: e.g. 'areutter'
      - fullname: e.g. 'Andrew Reutter'
    - fetch: function to call with no arguments to retry.
*/
const authEndpoint = 'https://jsonplaceholder.typicode.com/users/1'
const authOptions = { // define outside useAuth() so identity doesn't change and trigger more fetches.
  parseJSON: data => ({ // TODO AUTH: remove once talking to a real auth API.
    isAuthenticated: !!username,
    user: !username ? null : {username, fullname},
    routes: !!username ? ['/', '/users/', '/assignments/', '/projects/', '/sandbox/'] : [],
  }),
}
const NOT_AUTHENTICATED = {isAuthenticated:false, user:null, routes:[]}
const useAuth = () => { // TODO AUTH: use new /api/whoami route
  const {fetch, ready, response, error} = useFetches(authEndpoint, authOptions)
  const {isAuthenticated, user, routes} = response ? response.data : NOT_AUTHENTICATED
  return {fetch, ready, error, isAuthenticated, user, routes}
}

/*  useSignIn(username, password): provides a function() for signing the user in.
*/
const useSignIn = (username, password) => {
  const fetchOptions = useMemo(()=>({
    method: 'POST',
    bodyJSON: {username, password},
  }), [username, password])
  const {fetch} = useFetch('https://jsonplaceholder.typicode.com/posts/', fetchOptions) // TODO AUTH: use new/modified /api/signIn route
  return () => (
    fetch()
    .then(()=>{
      cookies.set('username', username, { path: '/' });
      cookies.set('fullname', 'Andrew Reutterkowski', { path: '/' });
      window.location.reload()
    })
    .catch(err=>{
      throw new SubmissionError({
        _error: (err.status === -1 ? err.message : 'Invalid username/password'),
      })
    })
  )
}

/*  useSignOut: provides a function() for signing the user out.
*/
const SIGN_OUT_FETCH_OPTIONS = {method:'POST'}
const useSignOut = () => { // TODO AUTH: use new/modified /api/signOut route
  const {fetch} = useFetch(
    'https://jsonplaceholder.typicode.com/posts/',
    SIGN_OUT_FETCH_OPTIONS,
  )
  const signOut = useMemo(()=>(
    () => fetch()
          .then(()=>{
            cookies.remove('username', { path: '/' });
            cookies.remove('fullname', { path: '/' });
            window.location.reload()
          })
  ), [fetch])
  return signOut
}

export {useAuth, useSignIn, useSignOut}
