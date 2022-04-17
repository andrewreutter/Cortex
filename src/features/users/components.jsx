import React from 'react'
import {compose} from 'recompose'

import {H6} from '../../core-lib/utils/components.jsx'
import {SearchInterface} from '../../core-lib/search/components.jsx'
// import {logsRender} from '../../core-lib/utils/higher-order.jsx'

import mockData from './mockdata.jsx'

/*  Handle any item with "name" in its attributes.
*/
const buildSearchDisplay = (secondaryAttributeMap, subCollectionMap) => (
  (firestore) => ({
    H1: ({item}) => <div style={{fontWeight:'bold'}}>{ item.attributes.name }</div>,
    H2: ({item}) => (
      <React.Fragment>
        { Object.entries(secondaryAttributeMap).map(
            ([attrName, attrTitle]) => <span>{attrTitle}: {item.attributes[attrName]}</span>
          )
        }
      </React.Fragment>
    ),
    Body: ({item}) => (
      <React.Fragment>
        { Object.entries(subCollectionMap).map(
            ([attrName, [title, searchDisplay]]) => (
              <React.Fragment>
                { !title ? null : <H6 noMargin>{title}</H6> }
                <SearchInterface
                  searchDisplay={searchDisplay(firestore)}
                  searchOperations={userSearchOperations}
                  firestore={firestore}
                  collectionName={`${item.path}/${attrName}`}
                />
              </React.Fragment>
            )
          )
        }
      </React.Fragment>
    )
  })
);
const diceSearchDisplay = buildSearchDisplay({die:'Die'}, {});
const limitSearchDisplay = buildSearchDisplay({description:'Limit'}, {});
const traitSetSearchDisplay = buildSearchDisplay(
  {},
  { dice:['', diceSearchDisplay],
    limits:['', limitSearchDisplay]
  }
);
const characterSearchDisplay = buildSearchDisplay({}, {trait_sets:['Trait Sets', traitSetSearchDisplay]});
const gameSearchDisplay = buildSearchDisplay({}, {characters:['Characters', characterSearchDisplay]});
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
      searchDisplay={gameSearchDisplay(firestore)}
      searchOperations={userSearchOperations}
      firestore={firestore}
      collectionName="games"
    />
  )
)

export {UsersRoute}
