import './App.css';
import './core-lib/ui/css/materialize.min.css'
import './core-lib/ui/css/material-icons.css'

import React, {useMemo} from 'react'

import {AppWithNav} from './core-lib/routing/components.jsx'
import {LoremIpsum} from './core-lib/utils/components.jsx'

import {useAuth, useSignIn, useSignOut} from './features/auth/hooks.jsx'

import {UsersRoute} from './features/users/components.jsx'
import {ProjectsRoute} from './features/projects/components.jsx'
import {AssignmentsRoute} from './features/assignments/components.jsx'
import {SandboxRoute} from './features/testpage/components.jsx'

const HomeRoute = () => ( // TODO LAUNCH: Make a Home route or remove this
  <React.Fragment>
    <LoremIpsum>Home</LoremIpsum>
  </React.Fragment>
)

const ROUTES = [
  {title:"Home",        path:"/",             exact:true, search:false, Component:HomeRoute},
  {title:"Users",       path:"/users/",       exact:true, search:true,  Component:UsersRoute},
  {title:"Projects",    path:"/projects/",    exact:true, search:true,  Component:ProjectsRoute},
  {title:"Assignments", path:"/assignments/", exact:true, search:true,  Component:AssignmentsRoute},
  {title:"Sandbox",     path:"/sandbox/",     exact:true, search:true,  Component:SandboxRoute}, // TODO LAUNCH: remove
]
const App = () => {
  const {fetch, ready, error, isAuthenticated, user, routes} = useAuth()
  const signOut = useSignOut()
  const authorizedRoutes = useMemo(
    () => {
      return ROUTES.filter(ROUTE=>routes.includes(ROUTE.path))
    },
    [routes],
  )
  return <AppWithNav {...{
    fetch, ready, error,
    isAuthenticated, user, routes: authorizedRoutes,
    signOut, useSignIn,
  }}/>
}

export default App;
