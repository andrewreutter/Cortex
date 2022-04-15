import PropTypes from 'prop-types'

/*  Define how a search result should be displayed.
*/
const searchDisplayComponent = PropTypes.func; // ({item, active}) => content
const searchDisplay = PropTypes.exact({
  H1: searchDisplayComponent.isRequired,  // Emphasized content in collapsed state.
  H2: searchDisplayComponent.isRequired,  // Other content in collapsed state.
  Body: searchDisplayComponent,           // If present, result will be expandable and render this when expanded.
})

/*  Define what operations can be performed on search results.
*/
const searchOperations = PropTypes.exact({
  selectedOperations: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
  })).isRequired,
  globalOperations: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
  })).isRequired,
})

export {searchDisplay, searchOperations}
