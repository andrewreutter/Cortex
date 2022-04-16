import PropTypes from 'prop-types'

const user = PropTypes.shape({
  uid: PropTypes.string.isRequired,
  displayName: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  photoURL: PropTypes.string.isRequired,
})

export {user}
