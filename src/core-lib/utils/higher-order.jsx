import React from 'react'
import classNames from 'classnames'

import {callIfFunction} from './functions.jsx'

const logsRender = logName => Component =>
  props => {
    console.log(`rendering ${logName}`)
    return <Component {...props}/>
  }

/*  Add a class or classes to the className prop passed to the wrapped Component,
    while still allowing additional className to be passed in. Supports all values that work
    with the classnames npm module, such as a string, key:boolean objects, etc...
    Will also accept a function that returns the same when passed the incoming props.

    Static example:

      const NewComponent = addsClassNames('red')(OldComponent)
      <NewComponent/> is now equivalent to <OldComponent className="red"/>
      <NewComponent className="wide"/> is now equivalent to <OldComponent className="red wide"/>

    Dynamic example:

      const NewComponent = addsClassNames({fixed}=>(fixed ? 'fixed' : null))(OldComponent)
      <NewComponent fixed className="wide"/> is now equivalent to <OldComponent className="fixed wide"/>
      <NewComponent className="wide"/> is now equivalent to <OldComponent className="wide"/>
*/
const addsClassNames = classToAdd => Component =>
  ({className, ...props}) => <Component {...props} className={classNames(callIfFunction(classToAdd, props), className)}/>

/*  Adds styles to the style prop passed to the wrapped Component, while still allowing
    style to be passed in. Value should be csskey:cssval just like the native style prop.
    Will also accept a function that returns the same when passed the incoming props.

    Static example:

      const NewComponent = addsStyle({marginTop:0})(OldComponent)
      <NewComponent/> is now equivalent to <OldComponent style={{marginTop:0}}/>
      <NewComponent style={{padding:0}}/> is now equivalent to <OldComponent style={{padding:0, marginTop:0}}/>

    Dynamic example:

      const NewComponent = addsClassNames({nopad}=>(nopad ? {padding:0} : {}))(OldComponent)
      <NewComponent nopad/> is now equivalent to <OldComponent style={{padding:0}}/>
*/
const addsStyle = stylesToAdd => Component =>
  ({style, ...props}) => <Component {...props} style={{...callIfFunction(stylesToAdd, props), ...(style||{})}}/>

/*  Add additional props when calling the wrapped Component.
    Can be static, or a function that derives new props from those passed in.

    Static example:

      const NewComponent = addsProps({foo:'bar'})(OldComponent)
      <NewComponent/> is now equivalent to <OldComponent foo="bar"/>

    Dynamic example:

      const NewComponent = addsProps({foo}=>({bar:foo+1}))(OldComponent)
      <NewComponent foo={42}/> is now equivalent to <OldComponent foo={42} bar={43}/>
*/
const addsProps = propsToAdd => Component =>
  props => <Component {...props} {...callIfFunction(propsToAdd, props)}/>

/*  Remove one or more props from being passed to the wrapped Component.
    Typically used if a passed-in prop was used to trigger addProps(),
    addStyle() from the ui feature module, or addClass() from the ui feature module.

    Example:

      const NewComponent = compose(
        addsStyle({fixed}=>(fixed ? {position:'fixed'} : {})),
        removesProps('fixed'),
      )(OldComponent)

      <NewComponent fixed/> is now equivalent to <OldComponent style={{position:'fixed'}}/>
*/
const removesProps = (...badProps) => Component =>
  props => (
    <Component {
      ...Object.keys(props).filter(p=>!badProps.includes(p)).reduce((x, p)=>({...x, [p]:props[p]}), {})
    }/>
  )

/*  Add a child or children to the wrapped component.
    Can be static, or a function that dervies children from the props passed in.

    Static example:

      const NewComponent = addsChildren('Foobar')(OldComponent)
      <NewComponent/> is now equivalent to <OldComponent>Foobar</OldComponent>

    Dynamic example:

      const NewComponent = addsChildren({foo}=>`${foo}bar`)(OldComponent)
      <NewComponent foo="soap"/> is now equivalent to <OldComponent foo="soap">soapbar</OldComponent>
*/
const addsChildren = childToAdd => Component =>
  ({children, ...props}) => (
    <Component {...props}>
      {children}
      {callIfFunction(childToAdd, props)}
    </Component>
  )

/*  If a provided function returns true when passed props, render the wrapped Component as normal.
    If it's false, render a React.Fragment instead, only passing through any provided children.

    Example:

      const NewComponent = fragmentUnless({foo}=>foo===42)(OldComponent)
      <NewComponent foo={11}>bar</NewComponent> is equivalent to <OldComponent foo={11}>bar</OldComponent>
      <NewComponent foo={42}>bar</NewComponent> is equivalent to <React.Fragement>bar</React.Fragement>
*/
const fragmentUnless = unless => Component =>
  props => (
    callIfFunction(unless, props)
    ? <Component {...props}/>
    : <React.Fragment children={props.children}/>
  )

  export {logsRender, addsClassNames, addsStyle, addsProps, removesProps, addsChildren, fragmentUnless}
