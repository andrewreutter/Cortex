import React from 'react'
import {Responsive} from './components.jsx'

/*  Intercept properties based on mobile vs. desktop.

    Arguments:
    - mobilePropNames: prop names that should only be applied on mobile (small and medium).
    - desktopPropNames: prop names that should only be applied on desktop (large and extra-large).
*/
const responsiveProps = (mobilePropNames=[], desktopPropNames=[]) => Component => (
  props => {
    const withoutPropNames = propNames => ({
      ...Object.keys(props).filter(p=>!propNames.includes(p)).reduce((x, p)=>({...x, [p]:props[p]}), {})
    })
    const mobileProps = withoutPropNames(desktopPropNames)
    const desktopProps = withoutPropNames(mobilePropNames)
    return (
      <Responsive
        Mobile={()=><Component {...mobileProps}/> }
        Desktop={() => <Component {...desktopProps}/>}
      />
    )
  }
)

export {responsiveProps}
