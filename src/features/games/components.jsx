import React from 'react'
import {compose} from 'recompose'
import {Link} from "react-router-dom"

import {UL, Div, P} from '../../core-lib/utils/components.jsx'
import {useTracksActive} from '../../core-lib/ui/hooks.jsx'
import {Card} from '../../core-lib/ui/cards/components.jsx'
import {Collection, Doc} from '../../core-lib/firebase/firestore/components.jsx'
// import {logsRender} from '../../core-lib/utils/higher-order.jsx'
import {addsStyle, addsClassNames} from '../../core-lib/utils/higher-order.jsx'

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
    item.attributes.die === 4
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
     orderBy={ item.attributes.name === 'Ability Scores' ? 'order' : 'name' }
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
    <h5 onClick={()=>{ toggleActive(item.id); }} >
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
