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
  H1: ({item}) => <div style={{fontWeight:'bold'}}>{ item.attributes.fullname }</div>,
  H2: ({item}) => (
    <React.Fragment>
      { item.attributes.username } - { item.attributes.roles.join(', ') }
    </React.Fragment>
  ),
  Body: ({item}) => (
    <React.Fragment>
      <H6 noMargin>Assignments</H6>
      <AssignmentsSearchInterface
        fixedHeader={false}
        searchToUrl={q=>`https://jsonplaceholder.typicode.com/users/?user=${item.id}`}
        searchDisplay={userAssignmentsSearchDisplay}
      />
    </React.Fragment>
  ),
}
const userSearchOperations = {
  selectedOperations: [],
  globalOperations: [
    {name:'Sync'},
  ],
}
const userFetchOptions = {
  delay: 1000, // TODO USERS: remove once connected to real API.
  mockData
}
const UsersRoute = compose(
  // logsRender('UsersRoute XXX'),
)(
  () => (
    <SearchInterface
      searchToUrl={q=>`https://jsonplaceholder.typicode.com/users/?q=${q}`} // TODO USERS: replace UsersRoute.SearchInterface.url with real API
      fetchOptions={userFetchOptions}
      searchDisplay={userSearchDisplay}
      searchOperations={userSearchOperations}
    />
  )
)

export {UsersRoute}
