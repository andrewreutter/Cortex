import {useMemo} from 'react'
//import {SubmissionError} from 'redux-form'
import { getAuth } from 'firebase/auth';
import { useAuthState, useSignInWithGoogle, useSignInWithFacebook } from 'react-firebase-hooks/auth';

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
    //console.log('auth', {firebaseApp, user});
    return {user, ready:!loading, error, isAuthenticated:!!user}
  }

  const signIn = (service) => {
    const serviceFn = serviceMap[service]
    //console.log('signIn', {service, serviceFn});
    return serviceFn();
  }
  const signInWith = (service) => {
    const serviceFn = serviceMap[service]
    //console.log('signIn', {service, serviceMap, serviceFn});
    //debugger;
    return serviceFn();
  }
  const signOut = () => fbAuth.signOut();

  //console.log('useAuthenticatorX', {user, fbAuth, serviceMap});
  return {auth, signIn, signInWith, signOut}
}

export {useAuthenticator}
