import './App.css';
import './core-lib/ui/css/materialize.min.css'
import './core-lib/ui/css/material-icons.css'

import React from 'react'
//import {useMemo} from 'react'
import { initializeApp } from 'firebase/app';

import {AppWithNav} from './core-lib/routing/components.jsx'
import {LoremIpsum} from './core-lib/utils/components.jsx'

import {useAuthenticator} from './core-lib/firebase/auth/hooks.jsx'
import {useFirestore} from './core-lib/firebase/firestore/hooks.jsx'

import {GamesRoute, GameRoute} from './features/games/components.jsx'
import {ProjectsRoute} from './features/projects/components.jsx'
//import {AssignmentsRoute} from './features/assignments/components.jsx'
import {SandboxRoute} from './features/testpage/components.jsx'

const firebaseConfig = {
  apiKey: "AIzaSyBpg-n8T1uQE2OkkVKZ6m10GefpfSjI4Bo",
  authDomain: "cortex-47687.firebaseapp.com",
  projectId: "cortex-47687",
  storageBucket: "cortex-47687.appspot.com",
  messagingSenderId: "474876048617",
  appId: "1:474876048617:web:40018cfb6f6f645d3aac78",
  measurementId: "G-7NHS3F6RPT"
};

const firebaseApp = initializeApp(firebaseConfig);

const HomeRoute = () => ( // TODO LAUNCH: Make a Home route or remove this
  <React.Fragment>
    <LoremIpsum>Home</LoremIpsum>
  </React.Fragment>
)

const ROUTES = [
  {title:"Home",        path:"/",             exact:true,   search:false, Component:HomeRoute, navigable:true},
  {title:"Games",       path:"/games/",       exact:true,   search:true,  Component:GamesRoute, navigable:true},
  {title:"Games - XXX", path:"/games/:gameId",       exact:false,  search:true,  Component:GameRoute, navigable:false},
  {title:"Projects",    path:"/projects/",    exact:true,   search:true,  Component:ProjectsRoute, navigable:true},
  //{title:"Assignments", path:"/assignments/", exact:true,  search:true,  Component:AssignmentsRoute, navigable:true},
  {title:"Sandbox",     path:"/sandbox/",     exact:true, search:true,  Component:SandboxRoute, navigable:true}, // TODO LAUNCH: remove
]
const App = () => {
  const authenticator = useAuthenticator(firebaseApp);
  const firestore = useFirestore(firebaseApp);
  /* XXX some authorization prolly
  const authorizedRoutes = useMemo(
    () => {
      return ROUTES.filter(ROUTE=>routes.includes(ROUTE.path))
    },
    [routes],
  )
  */
  return <AppWithNav {...{ authenticator, firestore, routes: ROUTES }}/>
}

export default App;
