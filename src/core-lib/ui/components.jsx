import React from 'react'
import PropTypes from 'prop-types'
import {compose} from 'recompose'

import {Div, I, Button as RawButton} from '../utils/components.jsx'
import {addsClassNames, addsStyle, removesProps} from '../utils/higher-order.jsx'
import {useClassNames} from '../utils/hooks.jsx'
import {useTracksActive} from './hooks.jsx'

/* Usage: <Icon [right]>menu</Icon>
*/
const Icon = compose(
  addsClassNames('material-icons'),
  addsClassNames(({right})=>(!!right ? 'right' : null)),
  removesProps('right'),
)(I)
Icon.propTypes = {
  ...I.propTypes,
  children: PropTypes.string.isRequired,
  right: PropTypes.bool,
}

/*  Horizontal progress indicator. Usage: <Progress [percentage="42"]/>

    If no value is provided for percentage, uses a looping animation.
*/
const Progress = ({percentage=null}) => (
  <div className="progress">
  { percentage === null
    ? <div className="indeterminate"></div>
    : <div className="determinate" style={{width:`${percentage}%`}}></div>
  }
  </div>
)
Progress.propTypes = {
  percentage: PropTypes.number,
}

/*  Usage: <Spinner [big||small]/>
*/
let Spinner;
(()=>{ // Spinner IIFE
  const SpinnerLayer = ({color}) => (
    <div className={`spinner-layer spinner-${color}`}>
      <div className="circle-clipper left">
        <div className="circle"></div>
      </div><div className="gap-patch">
        <div className="circle"></div>
      </div><div className="circle-clipper right">
        <div className="circle"></div>
      </div>
    </div>
  )
  Spinner = ({size}) => (
    <div className={`preloader-wrapper ${size} active`}>
      <SpinnerLayer color="blue"/>
      <SpinnerLayer color="red"/>
      <SpinnerLayer color="yellow"/>
      <SpinnerLayer color="green"/>
    </div>
  )
  Spinner.defaultProps = {
    size: '',
  }
  Spinner.propTypes = {
    size: PropTypes.oneOf(['', 'big', 'small']),
  }
})(); // END Spinner IIFE

/*  Just like native <button/> with appropriate styles.
*/
const Button = compose(
  addsClassNames('btn'),
  addsClassNames(({size})=>(size ? `btn-${size}` : '')),
  removesProps('size'),
)(RawButton)
Button.propTypes = {
  ...RawButton.propTypes,
  size: PropTypes.oneOf(['small', 'large']),
}

/*  An error div with appropriate styling.
*/
const Error = compose(
  addsClassNames('red lighten-3'),
  addsStyle({borderRadius:'.4em', padding:'.2em .4em'}),
)(Div)
Error.propTypes = Div.propTypes

const Collapsible = ( // TODO: doc and proptypes
  ({className, style={}, items, id, Body, Header, flat, compact}) => {
    className = useClassNames('collapsible', className)
    const noShadow = flat ? {boxShadow:'none', border:'none'} : {} // TODO: make useStyle?
    const headerStyle = {
      ...(compact ? {padding:'.5rem 1rem'} : {}),
      border: 'none'
    }
    const liStyle = {...noShadow, borderBottom:'1px solid #ddd'}
    const ulStyle = {...style, ...noShadow}
    const [isActive, toggleActive] = useTracksActive().slice(1) // avoid "unused variable: active" warning

    return (
      <ul {...{className}} style={ulStyle}>
      { items.map((item, idx)=>{
          const itemId = id(item)
          const isOpen = isActive(itemId)
          return (
            <li key={id(item)} className={isOpen ? 'active' : ''} style={liStyle}>
              <div className="collapsible-header" style={headerStyle}
                onClick={ !Body ? null : ()=>toggleActive(itemId) }
              >
                <Header {...{item}} active={isOpen}/>
              </div>
              <div className="collapsible-body" style={{display:(isOpen ? 'block' : 'none')}}>
                { isOpen ? <Body {...{item}} active={isOpen}/> : null }
              </div>
            </li>
          )
        }
      )}
      </ul>
    )
  }
)

export {Progress, Spinner, Button, Icon, Error, Collapsible}
