import React from 'react'
import PropTypes from 'prop-types'
import stylePropType from 'react-style-proptype'

/* So we can treat these like normal React components when composing, etc... */
const standardPropTypes = {
  className: PropTypes.string,
  style: stylePropType,
  children: PropTypes.node,
}
const Div = ({...props}) => <div {...props}/>; Div.propTypes = standardPropTypes;
const Span = ({...props}) => <span {...props}/>; Span.propTypes = standardPropTypes;
const I = ({...props}) => <i {...props}/>; I.propTypes = standardPropTypes;
const A = ({children, ...props}) => <a {...props}>{children}</a>; A.propTypes = standardPropTypes;
const P = ({...props}) => <p {...props}/>; P.propTypes = standardPropTypes;

const UL = ({...props}) => <ul {...props}/>; UL.propTypes = standardPropTypes;
const OL = ({...props}) => <ol {...props}/>; OL.propTypes = standardPropTypes;
const LI = ({...props}) => <li {...props}/>; LI.propTypes = standardPropTypes;

const H1 = ({children, noMargin, style, ...props}) => <h1 {...props} style={noMargin ? {...style, margin:0} : style}>{children}</h1>
H1.propTypes = { ...standardPropTypes, noMargin: PropTypes.bool, };
const H2 = ({children, noMargin, style, ...props}) => <h2 {...props} style={noMargin ? {...style, margin:0} : style}>{children}</h2>
H2.propTypes = { ...standardPropTypes, noMargin: PropTypes.bool, };
const H3 = ({children, noMargin, style, ...props}) => <h3 {...props} style={noMargin ? {...style, margin:0} : style}>{children}</h3>
H3.propTypes = { ...standardPropTypes, noMargin: PropTypes.bool, };
const H4 = ({children, noMargin, style, ...props}) => <h4 {...props} style={noMargin ? {...style, margin:0} : style}>{children}</h4>
H4.propTypes = { ...standardPropTypes, noMargin: PropTypes.bool, };
const H5 = ({children, noMargin, style, ...props}) => <h5 {...props} style={noMargin ? {...style, margin:0} : style}>{children}</h5>
H5.propTypes = { ...standardPropTypes, noMargin: PropTypes.bool, };
const H6 = ({children, noMargin, style, ...props}) => <h6 {...props} style={noMargin ? {...style, margin:0} : style}>{children}</h6>
H6.propTypes = { ...standardPropTypes, noMargin: PropTypes.bool, };

const Form = ({...props}) => <form {...props}/>; Form.propTypes = standardPropTypes;

const Button = ({...props}) => <button {...props}/>
Button.propTypes = {
  ...standardPropTypes,
}

/* A bunch of Lorem Ipsum text; each paragraph is prepended with any children provided. */
const LoremIpsum = ({children}) => (
  <React.Fragment>
    <p>{children} Lorem ipsum dolor sit amet, illum definitiones no quo, maluisset concludaturque et eum, altera fabulas ut quo. Atqui causae gloriatur ius te, id agam omnis evertitur eum. Affert laboramus repudiandae nec et. Inciderint efficiantur his ad. Eum no molestiae voluptatibus.</p>
    <p>{children} Lorem ipsum dolor sit amet, illum definitiones no quo, maluisset concludaturque et eum, altera fabulas ut quo. Atqui causae gloriatur ius te, id agam omnis evertitur eum. Affert laboramus repudiandae nec et. Inciderint efficiantur his ad. Eum no molestiae voluptatibus.</p>
    <p>{children} Lorem ipsum dolor sit amet, illum definitiones no quo, maluisset concludaturque et eum, altera fabulas ut quo. Atqui causae gloriatur ius te, id agam omnis evertitur eum. Affert laboramus repudiandae nec et. Inciderint efficiantur his ad. Eum no molestiae voluptatibus.</p>
    <p>{children} Lorem ipsum dolor sit amet, illum definitiones no quo, maluisset concludaturque et eum, altera fabulas ut quo. Atqui causae gloriatur ius te, id agam omnis evertitur eum. Affert laboramus repudiandae nec et. Inciderint efficiantur his ad. Eum no molestiae voluptatibus.</p>
    <p>{children} Lorem ipsum dolor sit amet, illum definitiones no quo, maluisset concludaturque et eum, altera fabulas ut quo. Atqui causae gloriatur ius te, id agam omnis evertitur eum. Affert laboramus repudiandae nec et. Inciderint efficiantur his ad. Eum no molestiae voluptatibus.</p>
    <p>{children} Lorem ipsum dolor sit amet, illum definitiones no quo, maluisset concludaturque et eum, altera fabulas ut quo. Atqui causae gloriatur ius te, id agam omnis evertitur eum. Affert laboramus repudiandae nec et. Inciderint efficiantur his ad. Eum no molestiae voluptatibus.</p>
    <p>{children} Lorem ipsum dolor sit amet, illum definitiones no quo, maluisset concludaturque et eum, altera fabulas ut quo. Atqui causae gloriatur ius te, id agam omnis evertitur eum. Affert laboramus repudiandae nec et. Inciderint efficiantur his ad. Eum no molestiae voluptatibus.</p>
    <p>{children} Lorem ipsum dolor sit amet, illum definitiones no quo, maluisset concludaturque et eum, altera fabulas ut quo. Atqui causae gloriatur ius te, id agam omnis evertitur eum. Affert laboramus repudiandae nec et. Inciderint efficiantur his ad. Eum no molestiae voluptatibus.</p>
    <p>{children} Lorem ipsum dolor sit amet, illum definitiones no quo, maluisset concludaturque et eum, altera fabulas ut quo. Atqui causae gloriatur ius te, id agam omnis evertitur eum. Affert laboramus repudiandae nec et. Inciderint efficiantur his ad. Eum no molestiae voluptatibus.</p>
    <p>{children} Lorem ipsum dolor sit amet, illum definitiones no quo, maluisset concludaturque et eum, altera fabulas ut quo. Atqui causae gloriatur ius te, id agam omnis evertitur eum. Affert laboramus repudiandae nec et. Inciderint efficiantur his ad. Eum no molestiae voluptatibus.</p>
  </React.Fragment>
)
LoremIpsum.propTypes = {
  children: PropTypes.node,
}

export {
  Div, Span, A, I, P,
  UL, OL, LI, Form, Button,
  H1, H2, H3, H4, H5, H6,
  LoremIpsum
}
