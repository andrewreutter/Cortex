import React from 'react'
import {compose} from 'recompose'

import {H6} from '../../core-lib/utils/components.jsx'
import {SearchInterface} from '../../core-lib/search/components.jsx'
import {AssignmentsSearchInterface, assignmentsSearchDisplay} from '../assignments/components.jsx'
// import {logsRender} from '../../core-lib/utils/higher-order.jsx'

import mockData from './mockdata.jsx'

const projectAssignmentsSearchDisplay = {
  ...assignmentsSearchDisplay,
  H2: ({item}) => (
    <React.Fragment>
      { item.relationships.user.attributes.fullname }
    </React.Fragment>
  ),
}

const projectsSearchDisplay = {
  H1: ({item}) => <div style={{fontWeight:'bold'}}>{ item.attributes.name }</div>,
  H2: ({item}) => (
    <React.Fragment>
    </React.Fragment>
  ),
  Body: ({item}) => (
    <React.Fragment>
      <H6 noMargin>Assignments</H6>
      <AssignmentsSearchInterface
        fixedHeader={false}
        searchToUrl={q=>`https://jsonplaceholder.typicode.com/users/?project=${item.id}`}
        searchDisplay={projectAssignmentsSearchDisplay}
      />
    </React.Fragment>
  )
}

const projectsSearchOperations = {
  selectedOperations: [],
  globalOperations: [],
}

const projectsFetchOptions = {
  delay: 1000, // TODO ASSIGNMENTS: remove once connected to real API.
  mockData,
}
const ProjectsRoute = compose(
  // logsRender('UsersRoute XXX'),
)(
  () => (
    <SearchInterface
      searchToUrl={q=>`https://jsonplaceholder.typicode.com/users/?q=${q}`} // TODO PROJECTS: replace ProjectsRoute.SearchInterface.url with real API
      fetchOptions={projectsFetchOptions}
      searchDisplay={projectsSearchDisplay}
      searchOperations={projectsSearchOperations}
    />
  )
)

export {ProjectsRoute, projectsFetchOptions}
