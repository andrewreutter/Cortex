import React, {useMemo} from 'react'
import PropTypes from 'prop-types'
import {compose} from 'recompose'
import stylePropType from 'react-style-proptype'

import {Div, Span} from '../../utils/components.jsx'
import {useNode} from '../../utils/hooks.jsx'
import {addsClassNames, addsStyle, removesProps} from '../../utils/higher-order.jsx'

import {useFormFactor, useNodeBounds} from './hooks.jsx'

/*  <Responsive> takes two Components and uses the appropriate one.

    IMPORTANT: To use this, you must also render <ResponsiveTest/> on the page;
    next to <App/> in index.js is typical.

    Props:
    - Mobile: Component to call on mobile
    - Desktop: Component to call on desktop

    To show nothing in a form factor, pass a function that returns an empty <React.Fragment/>
*/
// const HideOnLarge = addsClassNames('hide-on-large-only')(Span)
const ShowOnLarge = addsClassNames('hide-on-med-and-down')(Span)
const ResponsiveTest = () => <ShowOnLarge id="sizetest"/>
const Responsive = ({Mobile, Desktop}) => {
  const formFactor = useFormFactor()
  const Component = useMemo(()=>(
    {Mobile, Desktop}[formFactor] || (() => null)
  ), [formFactor, Mobile, Desktop])
  return <Component/>

}
Responsive.propTypes = {
  Mobile: PropTypes.func.isRequired,
  Desktop: PropTypes.func.isRequired,
}

/*  <Container/> is a container div per the Materialize grid: https://materializecss.com/grid.html
    Accepts className and style just like a native DOM element.
*/
const Container = addsClassNames('container')(Div)
Container.propTypes = Div.propTypes

/*  <Row/> is a container div per the Materialize grid: https://materializecss.com/grid.html
    Accepts className and style just like a native DOM element.
*/
const Row = compose(
  addsClassNames('row'),
  addsStyle(({compact})=>(compact ? {width:'100%', marginBottom:0} : {})),
  removesProps('compact')
)(
  Div
)
Row.propTypes = {
  ...Div.propTypes,
  compact: PropTypes.bool,
}

/*  <Col/> is a column per the Materialize grid: https://materializecss.com/grid.html

    Props:
      - s, m, l, xl: how many of the 12 columns to fill in that form factor.
      - noPadding: suppress padding.
      - children, className, style: just like a native DOM element.
*/
const Col = compose(
  addsClassNames(({s,m,l,xl})=>`col s${s} m${m||s} l${l||m||s} xl${xl||l||m||s}`),
  addsStyle(({noPadding})=>(noPadding ? {padding:0} : {})),
  removesProps('s', 'm', 'l', 'xl', 'noPadding'),
)(Div)
Col.defaultProps = {s:12}
Col.propTypes = {
  ...Div.propTypes,
  s: PropTypes.number,
  m: PropTypes.number,
  l: PropTypes.number,
  xl: PropTypes.number,
  noPadding: PropTypes.bool,
}

/* Center content both vertically and horizontal; use as the only child of the <body> */
const CenteredBody = addsStyle({
  position:'absolute', top:'50%', left:'50%', transform:'translateX(-50%) translateY(-50%)'
})(Div)
CenteredBody.propTypes = Div.propTypes

/*  Center children horizontally.
*/
const Center = addsClassNames('center-align')(Div)
Center.propTypes = Div.propTypes

/*  Make the first child position:fixed, but let the rest scroll, e.g.:

    <FixFirstChild>
      <ComponentToFix/>
      <ScrollableOne/>
      <ScrollableTwo/>
    </FixFirstChild>
*/
const FixFirstChild = ({children, fixedStyle={}}) => {
  /*  Our strategy is:
      - Render a container with 100% width. Wait until we have a reference to it.
      - Render a fixed div using the top and width of the container; include the first child.
        Wait until we have a reference to it.
      - Render a div with top padding that accounts for the height of the fixed container.
        Include remaining children.
  */

  const [containerRef, containerNode] = useNode()
  const {ready:containerReady, ...containerBounds} = useNodeBounds(containerNode)

  const [headerRef, headerNode] = useNode()
  const {ready:headerReady, ...headerBounds} = useNodeBounds(headerNode)

  return (
    <div ref={containerRef} style={{width:'100%'}}>
    { !containerReady ? null : (
      <div ref={headerRef} style={{...fixedStyle, width:containerBounds.width, position:'fixed', top:containerBounds.top, zIndex:1}}>
        { children[0] }
      </div>
    )}
    { !headerReady ? null : (
      <div style={{paddingTop:headerBounds.height}}>
        { children.slice(1) }
      </div>
    )}
    </div>
  )
}
FixFirstChild.propTypes = {
  children: PropTypes.node.isRequired,
  fixedStyle: stylePropType,  // use to set a background color to ensure scrolling content doesn't peek through.
}

export {
  Responsive, ResponsiveTest,
  Container, Row, Col,
  Center, CenteredBody,
  FixFirstChild,
}
