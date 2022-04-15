import React from 'react'
import PropTypes from 'prop-types'

import {Progress} from '../ui/components.jsx'

/*  Show a progress indicator when fetching, leave space when not.
*/
const ProgressWhenFetching = ({fetching}) => (
  <div style={{height:'4px', visibility:(fetching ? 'visible' : 'hidden')}}>
    <Progress/>
  </div>
)
ProgressWhenFetching.propTypes = {
  fetching: PropTypes.bool.isRequired,
}

export {ProgressWhenFetching}
