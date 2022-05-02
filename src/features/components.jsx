import {compose} from 'recompose'

import {addsStyle} from '../core-lib/utils/higher-order.jsx'
import {Card} from '../core-lib/ui/cards/components.jsx'

const CortexCard = compose(
  addsStyle({
    border:'solid 1px #E1CCAF',
    padding:'1em',
    backgroundColor:'#FFFAF4',
  })
)(Card);

export {CortexCard}
