import React, {useEffect, useState, useMemo} from 'react'
import PropTypes from 'prop-types'
import stylePropType from 'react-style-proptype'
import {compose} from 'recompose'
import { BrowserRouter as Router, Route, Link, Switch, withRouter } from "react-router-dom";

import {route} from './proptypes.jsx'
import {user} from '../auth/proptypes.jsx'
import {addsProps, removesProps, addsChildren, fragmentUnless, addsStyle, addsClassNames} from '../utils/higher-order.jsx'
// import {logsRender} from '../utils/higher-order.jsx'
import {Div, UL, LI, A} from '../utils/components.jsx'
import {SignInForm} from '../firebase/auth/components.jsx'
import {SearchForm} from '../search/components.jsx'
import {Responsive, CenteredBody} from '../ui/layout/components.jsx'
import {responsiveProps} from '../ui/layout/higher-order.jsx'
import {Spinner, Error, Icon} from '../ui/components.jsx'

/*  <ScrollToTop> scrolls to the top of its children when the route path changes.
    No props, just children.
*/
let ScrollToTop;
(()=>{
  const useScrollToTop = pathname => {
    useEffect(() => {
      window.scrollTo(0, 0);
    }, [pathname]);
  }
  ScrollToTop = withRouter(
    ({ children, location: { pathname } }) => {
      useScrollToTop(pathname)
      return children;
    }
  )
  ScrollToTop.propTypes = {
    children: PropTypes.node,
  }
})()

/*  A Navlink is an <li> that houses a single child, and that might be active.
*/
const Navlink = compose(
  addsClassNames(({active})=>(active ? 'active' : '')),
  removesProps('active'),
)(LI)
Navlink.propTypes = {
  ...LI.propTypes,
  active: PropTypes.bool,
  children: PropTypes.element.isRequired,
}

const AppPageWithNav = ({title, search, routes, user, authenticator, children}) => {
  const Navlinks = useMemo(()=>(
    <React.Fragment>
      {routes
       .filter(route=>route.navigable)
       .map(({path, exact, title})=>(
        <Route key={path} {...{path, exact}} children={({match}) => (
          <Navlink active={!!match}>
            <Link to={path}>{title}</Link>
          </Navlink>
         )}
        />
      ))}
      <Navlink style={{position:'fixed', bottom:'48px', width:'100%'}}>
        <Link to="." className="truncate" style={{fontSize:'1.6em'}}>{user.fullname}</Link>
      </Navlink>
      <Navlink style={{position:'fixed', bottom:0, width:'100%'}}>
        <Link to="." onClick={authenticator.signOut}>Sign out</Link>
      </Navlink>
    </React.Fragment>
  ), [routes, user, authenticator])
  return <PageWithNav {...{search, title, children, Navlinks}}/>
}
AppPageWithNav.propTypes = {
  search: PropTypes.bool,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  routes: PropTypes.arrayOf(route).isRequired,
  user: user.isRequired,
  //authenticator: PropTypes.shape({
    //signOut: PropTypes.fn.isRequired, // must be callable with no arguments.
  //}).isRequired,
}

/*  RoutingApp is a <Router> for overall page routing for clients that have already
    authenticated a user and determined what routes they are authorized for.
*/
const RoutingApp = ({routes, user, authenticator, firestore}) => {

  /*  If we define a route component inline, e.g.: <Route component={()=><Thing/>}/>,
      then the route component is different on every render and will always get re-rendered
      So store the route components in a memo, and since that didn't even seem to do the trick,
      also do a bit of manual caching so we only render each route component once.
  */
  const routesWithPageComponents = useMemo(()=>{
    return routes.map(
      ({path, exact, title, search, Component})=>{
        let cached = null
        const PageComponent = () => (cached = cached ? cached : (
          <AppPageWithNav {...{title, search, routes, user, authenticator}}>
            <Component firestore={firestore}/>
          </AppPageWithNav>
        ))
        return {path, exact, PageComponent}
      }
    )
  }, [routes, user, authenticator, firestore])

  /*  Like PageWithNav, but fills in the Navlinks prop from RouteingApp props.
  */
  return (
    <Router>
      <ScrollToTop>
        <Switch>
          {routesWithPageComponents.map(({path, exact, PageComponent})=>(
            <Route key={path} {...{path, exact}} component={PageComponent}/>
          ))}
          <Route component={()=>(
            <AppPageWithNav title="Page Not Found">
              <h2>Page Not Found</h2>
            </AppPageWithNav>
          )}/>
        </Switch>
      </ScrollToTop>
    </Router>
  )
}
RoutingApp.propTypes = {
  routes: PropTypes.arrayOf(route).isRequired,
  user: user.isRequired,
  firestore: PropTypes.shape({}).isRequired,
  //authenticator: PropTypes.shape({
    //signOut: PropTypes.fn.isRequired,
  //}).isRequired, // must be callable with no arguments.
}

let Navbar;
(()=>{

  /* The sidenav that slides out on mobile */
  const Sidenav = compose(
    addsStyle({height:'100%', transition:'transform .2s linear'}),
    addsStyle(({isOpen})=>(!isOpen ? {} : {transform:'translateX(0%)'}))
  )(
   ({isOpen, close, children, style}) => (
     <React.Fragment>
        <ul className="sidenav" {...{style}}>
          {children}
        </ul>
        <div className="sidenav-overlay"
          style={!isOpen ? {} : {display: 'block', opacity: 1}}
          onClick={close}
        ></div>
     </React.Fragment>
   )
  )
  Sidenav.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    close: PropTypes.func.isRequired,
    children: PropTypes.node,
  }

  const NavbarWrapperIfFixed = compose(
    fragmentUnless(({fixed})=>fixed),  // So we just get a <React.Fragment> if we didn't get a truthy "fixed" prop.
    removesProps('fixed'),       // shuts up a warning about <div fixed> which isn't a thing.
    addsClassNames('navbar-fixed'),  //
  )(Div)
  NavbarWrapperIfFixed.propTypes = {
    fixed: PropTypes.bool.isRequired,
  }

  /*  NavIcon: an <a> that lives inside the title bar, displays a specified icon,
      and only triggers its onClick on mobile.
  */
  const NavIcon = compose(
    addsClassNames('sidenav-trigger'),
    addsStyle({display:'block', color:'inherit'}),
    addsChildren(({icon})=><Icon>{icon}</Icon>),
    removesProps('icon'),
    responsiveProps(['onClick']),
  )(A)
  NavIcon.propTypes = {
    ...A.propTypes,
    icon: PropTypes.string.isRequired,
  }

  /* PageTitleContent appears between the home and search icons, which varies by form factor. */
  const PageTitle = addsStyle({fontSize:'2em'})(Div)
  const PageTitleContent = ({mobileSearchOpen, title, search}) => (
    <Responsive
      Mobile={()=>(
        <React.Fragment>
          { mobileSearchOpen
            ? <SearchForm autoFocus style={{width:'calc(100% - 124px)'}}/>
            : <PageTitle>{title}</PageTitle>
          }
        </React.Fragment>
      )}
      Desktop={()=>(
        <React.Fragment>
          { !search
            ? null
            : <SearchForm className="right" style={{width:'300px'}}/>
          }
          <PageTitle style={{paddingLeft:'calc(300px + .5em)'}}>{title}</PageTitle>
        </React.Fragment>
      )}
    >
    </Responsive>
  )
  PageTitleContent.propTypes = {
    mobileSearchOpen: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    search: PropTypes.bool,
  }

  /*  Navbar appears at the top of the page.
  */
  Navbar = compose(
    addsClassNames('white grey-text text-darken-3'),
    addsStyle({boxShadow:'none', borderBottom:'1px solid #eee'}),
  )(
    ({
      Navlinks, navKey, title,
      fixed, search,
      style, className,
    }) => {
      const [mobileNavOpen, setMobileNavOpen] = useState(false)
      const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
      return (
        <React.Fragment>
          <NavbarWrapperIfFixed {...{fixed}}>
            <nav {...{style, className}}>
              <div className="nav-wrapper">
                <NavIcon icon="menu" onClick={()=>setMobileNavOpen(!mobileNavOpen)}/>
                { !search ? null :
                  <NavIcon icon="search" className="right" onClick={()=>setMobileSearchOpen(!mobileSearchOpen)}/>
                }
                <PageTitleContent {...{mobileSearchOpen, title, search}}/>
              </div>
            </nav>
          </NavbarWrapperIfFixed>

          <Sidenav isOpen={mobileNavOpen} close={()=>setMobileNavOpen(false)}>
            { Navlinks }
          </Sidenav>

        </React.Fragment>
      )
    }
  )
  Navbar.defaultProps = {
    navKey: 'app-nav',
  }
  Navbar.propTypes = {
    navKey: PropTypes.string.isRequired,
    Navlinks: PropTypes.node,
    title: PropTypes.string.isRequired,

    fixed: PropTypes.bool,
    search: PropTypes.bool,

    style: stylePropType,
    className: PropTypes.string,
  }

})()

let PageWithNav
(()=>{ // START NAV IIFE

  /*  DesktopSidenav is always visible (transform:initial) but styled like mobile nav. */
  const DesktopSidenav = compose(
    addsClassNames('sidenav'),
    addsStyle({top:'64px', transform:'initial', float:'left', boxShadow:'none', height:'calc(100% - 64px)'})
  )(UL)
  DesktopSidenav.propTypes = UL.propTypes

  /* This is what we put the overall page content in */
  const Content = compose(
    addsProps({padRight:true}),
    responsiveProps([], ['padRight']),
    addsStyle(({padRight})=>padRight ? {paddingRight:'1em'} : {}),
    removesProps('padRight'),
    // addsStyle({paddingLeft:'1em', paddingRight:'1em'}),
    // logsRender('Content XXX'),
  )(Div)
  Content.propTypes = Div.propTypes

  /*  PageWithNav is a standard page layout with a title bar, nav, content, and optional search.

      Props:
      - title: name of the page.
      - search: set true to include a search box.
      - children: are displayed in the main content of the page.
      - Navlinks: content to insert in the navigation,
        typically a React.Fragment containing Navlink elements.
  */
  PageWithNav = compose(
    // logsRender('PageWithNav XXX'),
  )(
    ({Navlinks, title, search, children}) => {
      return (
        <React.Fragment>
          <Navbar fixed {...{Navlinks, title, search}}/>
          <Responsive
            Mobile={()=><Content>{children}</Content>}
            Desktop={()=>(
              <React.Fragment>
                <DesktopSidenav>{Navlinks}</DesktopSidenav>
                <Content style={{paddingLeft:'calc(300px + 1em)'}}>{children}</Content>
              </React.Fragment>
            )}
          />
        </React.Fragment>
      )
    }
  )
  PageWithNav.propTypes = {
    search: PropTypes.bool,
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    Navlinks: PropTypes.node.isRequired,
  }

})() // END NAV IIFE


/*  AppWithNav is an entire app, as defined by routes and auth data that can be loaded in.

    Props:
    - authenticator: an implementation of the Authenticator interface. XXX document Authenticator interface.
    - firestore: as returned by firebase/firestore/useFirestore()
    - routes: array of routes that the user is authorized to use.
*/
const AppWithNav = ({
  authenticator,
  firestore,
  routes,
}) => {
  const {ready, error, isAuthenticated, user} = authenticator.auth();
  return !ready
    ? <CenteredBody><Spinner size="big"/></CenteredBody>
    : (
      error
      ? <CenteredBody><Error onClick={()=>authenticator.auth()}>{error.message}: click to try again</Error></CenteredBody>
      : (
        isAuthenticated
        ? <RoutingApp {...{routes, user, authenticator, firestore}}/>
        : <Responsive
            Mobile={()=><SignInForm {...{authenticator}} style={{margin:'4rem auto'}}/>}
            Desktop={()=>(
              <CenteredBody>
                <SignInForm {...{authenticator}}/>
              </CenteredBody>
            )}
          >
          </Responsive>
      )
    )
}
AppWithNav.propTypes = {
  authenticator: PropTypes.shape({
  }).isRequired,
  firestore: PropTypes.shape({
  }).isRequired,
  routes: PropTypes.arrayOf(route).isRequired,
}

export {ScrollToTop, RoutingApp, PageWithNav, AppWithNav}
