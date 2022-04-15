import {addsClassNames} from '../../utils/higher-order.jsx'
import {Div} from '../../utils/components.jsx'

/*  These are a subset of the Card offerings from Materialize: https://materializecss.com/cards.html
*/
const Card = addsClassNames('card')(Div); Card.propTypes = Div.propTypes;
const CardContent = addsClassNames('card-content')(Div); Card.propTypes = Div.propTypes;
const CardFooter = addsClassNames('card-action')(Div); Card.propTypes = Div.propTypes;
const CardTitle = addsClassNames('card-content')(Div); Card.propTypes = Div.propTypes;

export {Card, CardContent, CardFooter, CardTitle}
