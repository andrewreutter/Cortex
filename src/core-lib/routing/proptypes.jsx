import PropTypes from 'prop-types'

const route = PropTypes.shape({
  path: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  exact: PropTypes.bool,
  search: PropTypes.bool,
  Component: PropTypes.func.isRequired, // functional component that can be called without props.
})

export {route}
