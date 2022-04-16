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
  const signOut = () => fbAuth.signOut();

  console.log('useAuthenticator', {fbAuth, serviceMap});
  return {auth, signIn, signInWith, signOut}
}

export {useAuthenticator}
