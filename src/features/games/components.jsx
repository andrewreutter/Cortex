import React from 'react'
import {compose} from 'recompose'
import {Link} from "react-router-dom"

import {H6, UL, Div, P} from '../../core-lib/utils/components.jsx'
import {useTracksActive} from '../../core-lib/ui/hooks.jsx'
import {Error} from '../../core-lib/ui/components.jsx'
import {Card} from '../../core-lib/ui/cards/components.jsx'
import {SearchInterface} from '../../core-lib/search/components.jsx'
import {useCollectionData} from '../../core-lib/firebase/firestore/hooks.jsx'
import {Collection, Doc} from '../../core-lib/firebase/firestore/components.jsx'
// import {logsRender} from '../../core-lib/utils/higher-order.jsx'
import {addsStyle, addsClassNames} from '../../core-lib/utils/higher-order.jsx'

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

const noShadow = {boxShadow:'none', border:'none'};
const FlatUL = compose(
  addsStyle(noShadow),
  addsClassNames('collapsible'),
)(UL);

const GamesListItem = ({item}) => (
  <li style={noShadow}>
    <Link to={`/${item.path}`}>
      <div className="collapsible-header" style={{fontWeight:'bold'}}>
        { item.attributes.name }
      </div>
    </Link>
  </li>
)

const GamesRoute = ({firestore}) => (
  <Collection
   firestore={firestore}
   collectionName="games"
   CollectionComponent={FlatUL}
   ItemComponent={GamesListItem}
  />
)

const CortexDiv = compose(
  addsStyle({
    border:'solid 1px #E1CCAF',
    padding:'1em',
    backgroundColor:'#FFFAF4',
  })
)(Card)

const DieItem = ({firestore, item}) => (
  <div>{
    item.attributes.die == 4
    ? <span>{item.attributes.name} d{item.attributes.die}</span>
    : <b>{item.attributes.name} d{item.attributes.die}</b>
  }</div>
)
const LimitItem = ({firestore, item}) => (
  <span>
    <b>Limit:</b> <i>{item.attributes.name}</i>. {item.attributes.description}
  </span>
)
const TraitSetItem = ({firestore, item}) => (
  <CortexDiv style={{marginTop:'1em'}}>
    <h6><u><b>{item.attributes.name}</b></u></h6>
    <Collection
     firestore={firestore}
     collectionName={`${item.path}/dice`}
     orderBy="name"
     CollectionComponent={Div}
     ItemComponent={DieItem}
    />
    <Collection
     firestore={firestore}
     collectionName={`${item.path}/limits`}
     CollectionComponent={P}
     ItemComponent={LimitItem}
    />
  </CortexDiv>
)
const CharacterItem = ({firestore, item}) => {
  const [isActive, toggleActive] = useTracksActive().slice(1) // avoid "unused variable: active" warning
  const isOpen = isActive(item.id);
  return <CortexDiv style={{marginTop:'1em'}}>
    <h5
     onClick={()=>{
      console.log('h5XXX');
      toggleActive(item.id);
     }}
    >
      {item.attributes.name}
    </h5>
    <div style={{display:(isOpen ? 'block' : 'none')}}>
      <Collection
       firestore={firestore}
       collectionName={`${item.path}/trait_sets`}
       orderBy="order"
       CollectionComponent={Div}
       ItemComponent={TraitSetItem}
      />
    </div>
  </CortexDiv>
}

const GameDoc = ({firestore, doc}) => (
  <div style={{padding:'0 2em 2em'}}>
    <h3>{doc.attributes.name}</h3>
    <h4>Characters</h4>
    <Collection
     firestore={firestore}
     collectionName={`${doc.path}/characters`}
     CollectionComponent={Div}
     ItemComponent={CharacterItem}
    />
  </div>
)

// XXX hardcoded docPath!!!
const GameRoute = ({firestore, ...rest}) => (
  <Doc
   firestore={firestore}
   docPath={'games/IYbx9XbB9eqiAWjUjR3O'}
   DocComponent={GameDoc}
  />
)

export {GamesRoute, GameRoute}
