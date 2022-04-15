import React from 'react'
import {compose} from 'recompose'
import PropTypes from 'prop-types'

import {removesProps, addsClassNames} from '../../utils/higher-order.jsx'
import {Div} from '../../utils/components.jsx'
import {Col} from '../layout/components.jsx'

/*  <InputWrapper> dresses up an input per Materialize: https://materializecss.com/text-inputs.html

    Requires a single child and allows the following props:
    - className, style: as a native DOM element.
    - inline: prevents the input from being full-width.
*/
const InputWrapper = compose(
  addsClassNames('input-field'),
  addsClassNames(({inline})=>(inline ? 'inline' : null)),
  removesProps('inline'),
)(Div)
InputWrapper.propTypes = {
  ...Div.propTypes,
  inline: PropTypes.bool,
  children: PropTypes.element.isRequired,
}

/*  <InputCol> is like <Col>, but requires a single child.
*/
const InputCol = addsClassNames('input-field')(Col)
InputCol.propTypes = {
  ...Col.propTypes,
  children: PropTypes.element.isRequired,
}

/*  <Checkbox onChange={e={}} [checked]/>
*/
const Checkbox = ({checked, onChange}) => {
  return <label>
    <input type="checkbox" className="filled-in" {...{checked, onChange}} />
    <span/>
  </label>
}
Checkbox.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,  // required so this is a "controlled component" that plays with "checked"
}

export {InputWrapper, InputCol, Checkbox}
