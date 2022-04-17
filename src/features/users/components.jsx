import React from 'react'
import {compose} from 'recompose'

import {H6} from '../../core-lib/utils/components.jsx'
import {SearchInterface} from '../../core-lib/search/components.jsx'
import {AssignmentsSearchInterface, assignmentsSearchDisplay} from '../assignments/components.jsx'
// import {logsRender} from '../../core-lib/utils/higher-order.jsx'

import mockData from './mockdata.jsx'

const userAssignmentsSearchDisplay = {
  ...assignmentsSearchDisplay,
  H2: ({item}) => (
    <React.Fragment>
      { item.relationships.project.attributes.name }
    </React.Fragment>
  ),
}
const userSearchDisplay = {
  H1: ({item}) => <div style={{fontWeight:'bold'}}>{ item.attributes.name }</div>,
  H2: ({item}) => (
    <React.Fragment>
      { item.attributes.name }
    </React.Fragment>
  ),
  Body: ({item}) => (
    <React.Fragment>
      <H6 noMargin>Characters</H6>
    </React.Fragment>
  ),
}
const userSearchOperations = {
  selectedOperations: [],
  globalOperations: [],
}
const userFetchOptions = {
  delay: 1000, // TODO USERS: remove once connected to real API.
  mockData
}
const UsersRoute = compose(
  // logsRender('UsersRoute XXX'),
)(
  ({firestore}) => (
    <SearchInterface
      fetchOptions={userFetchOptions}
      searchDisplay={userSearchDisplay}
      searchOperations={userSearchOperations}
      firestore={firestore}
      collectionName="games"
    />
  )
)

export {UsersRoute}
