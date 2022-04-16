import {useMemo} from 'react'
//import {SubmissionError} from 'redux-form'
import Cookies from 'universal-cookie';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useAuthState, useSignInWithGoogle, useSignInWithFacebook } from 'react-firebase-hooks/auth';

import {useFetch, useFetches} from '../../../core-lib/fetch/hooks.jsx'


const cookies = new Cookies(); // TODO AUTH: remove once we're talking to a real auth API
//const username = cookies.get('username')
//const fullname = cookies.get('fullname')

const useAuthenticator = (firebaseApp) => {
  const fbAuth = useMemo(
    ()=>getAuth(firebaseApp),
    [firebaseApp]
  )

  //const fbAuth = getAuth(firebaseApp);
  const [user, loading, error] = useAuthState(fbAuth);

  const [signInWithGoogle] = useSignInWithGoogle(fbAuth);
  const [signInWithFacebook] = useSignInWithFacebook(fbAuth);
  const serviceMap = {
    Google: signInWithGoogle,
    Facebook: signInWithFacebook,
  }

  const auth = () => {
    console.log('auth', {firebaseApp, user});
    return {user, ready:!loading, error, isAuthenticated:!!user}
  }

  const signIn = (service) => {
    const serviceFn = serviceMap[service]
    console.log('signIn', {service, serviceFn});
    return serviceFn();
  }
  const signInWith = (service) => {
    const serviceFn = serviceMap[service]
    console.log('signIn', {service, serviceMap, serviceFn});
    //debugger;
    return serviceFn();
  }

  console.log('useAuthenticator', {fbAuth, serviceMap});
  return {auth, signIn, signInWith}
}

/*  useAuth(): hook that fetches data about the current user. Returns an object with properties:

    - ready: false until we know whether the user is authenticated.
    - error: FetchError instance, if any.
    - isAuthenticated: true if the user is signed in.
    - user: null if not authenticated; if authenticated, an object with properties:
      - XXX TODO: figure out what user object looks like.
                  https://firebase.google.com/docs/reference/js/firebase.User
      - username: e.g. 'areutter'
      - fullname: e.g. 'Andrew Reutter'
*/
// define outside useAuth() so identity doesn't change and trigger more fetches.
const useAuth = (firebaseApp) => {
  const [user, loading, error] = useAuthState(getAuth(firebaseApp));
  console.log('useAuth', {firebaseApp, user});
  return {user, ready:!loading, error, isAuthenticated:!!user}
}

/*  useSignIn(): returns a function signIn(service) for signing the user in.
    service is one of 'Google', 'Facebook'
*/
const useSignIn = (firebaseApp) => {
  const auth = getAuth(firebaseApp);
  const {signInWithGoogle} = useSignInWithGoogle(auth);
  const {signInWithFacebook} = useSignInWithFacebook(auth);
  const serviceMap = {
    Google: signInWithGoogle,
    Facebook: signInWithFacebook,
  }
  return (service) => serviceMap[service]();
}

const useSignInWith = (firebaseApp) => {
  const auth = getAuth(firebaseApp);
          onAuthStateChanged(auth, (user) => {
	      console.log('oASC', {user})
          });
  const [signInWithGoogle] = useSignInWithGoogle(auth);
  const [signInWithFacebook] = useSignInWithFacebook(auth);
  //console.log('useSignInWith', {auth, signInWithFacebook})
  const serviceMap = {
    Google: signInWithGoogle,
    Facebook: signInWithFacebook,
  }
  return (service) => {
    const serviceFn = serviceMap[service];
    console.log('useSignInWith.called', {service, serviceMap, serviceFn})
    const retPromise = serviceFn()
    retPromise
      .then((result) => {
        console.log('SUXXX', {result})
      })
      .catch((result) => {
        console.log('FAILXXX', {result})
      })
    return retPromise;
  }
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

export {useAuth, useSignIn, useSignOut, useSignInWith, useAuthenticator}
