import React from 'react'
import {SearchInterface} from '../../core-lib/search/components.jsx'

import mockData from './mockdata.jsx'

const assignmentsSearchDisplay = {
  H1: ({item}) => <b>{ item.attributes.name }</b>,
  H2: ({item}) => (
    <React.Fragment>
      { item.relationships.project.attributes.name } - { item.relationships.user.attributes.fullname }
    </React.Fragment>
  ),
}
const assignmentsSearchOperations = {
  selectedOperations: [
    {name:'Delete'},
  ],
  globalOperations: [],
}
const assignmentsFetchOptions = {
  delay: 1000, // TODO ASSIGNMENTS: remove once connected to real API.
  mockData,
}
const AssignmentsSearchInterface = ({
  searchToUrl=q=>`https://jsonplaceholder.typicode.com/posts/?q=${q}`,
  searchDisplay=assignmentsSearchDisplay,
  searchOperations=assignmentsSearchOperations,
  fixedHeader=true,
}) => (
  <SearchInterface {...{searchToUrl, searchDisplay, searchOperations, fixedHeader}}
    fetchOptions={assignmentsFetchOptions}
  />
)
const AssignmentsRoute = AssignmentsSearchInterface

export {AssignmentsRoute, AssignmentsSearchInterface, assignmentsSearchDisplay, assignmentsSearchOperations}
