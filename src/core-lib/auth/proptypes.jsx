import PropTypes from 'prop-types'

const user = PropTypes.shape({
  username: PropTypes.string.isRequired,
  fullname: PropTypes.string.isRequired,
})

export {user}
