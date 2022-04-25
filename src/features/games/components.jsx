import React from 'react'
import {useState, useMemo, useEffect} from 'react'
import {compose} from 'recompose'
import {Link} from "react-router-dom"
import {useForm} from "react-hook-form";
import {collection, getDoc, doc} from 'firebase/firestore';

import {InputWrapper} from '../../core-lib/ui/forms/components.jsx'
import {UL, Span, Div, P} from '../../core-lib/utils/components.jsx'
import {useTracksActive} from '../../core-lib/ui/hooks.jsx'
import {Card} from '../../core-lib/ui/cards/components.jsx'
import {Collection, Doc} from '../../core-lib/firebase/firestore/components.jsx'
import {postConverter, useDocData, useCollectionData} from '../../core-lib/firebase/firestore/hooks.jsx'
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
const CharacterStepItem = ({firestore, item}) => {
  return <CortexDiv>
    <Doc
     firestore={firestore}
     docPath={item.attributes.stepRef.path}
     DocComponent={StepItem}
    />
  </CortexDiv>
}
/* Take a character doc and elaborate it. */
const useCharacterBuilder = (firestore, item) => {
  const {response:steps, ready} = useCollectionData(firestore, `${item.path}/steps`);
  // XXX TODO: also pull error from useCollectionData() and do something with it.
  const stepPaths = useMemo(
    () => ready ? steps.map(step=>step.attributes.stepRef.path) : null,
    [ready, steps]
  );

  const [stepResults, setStepResults] = useState(null);
  useEffect(()=>{
    // XXX TODO: make this responsive to changes in the firestore.
    if (stepPaths && !stepResults)
    Promise
      .all(
        stepPaths.map(
          stepPath => {
            const stepDoc = doc(firestore, stepPath).withConverter(postConverter);
            return getDoc(stepDoc).then(response=>response.data());
          }
        )
      )
      .then(response => setStepResults(response))
    ;
  });

  const pathsTraitSets = useMemo(
    () => (!stepResults
      ? []
      : stepResults.map(
        path => markupToTraitSets(path.attributes.markup)
      )
    ),
    [stepResults]
  );

  const traitSets = useMemo(
    () => {
      const mergedTraitSets = [], keyedTraitSets = {};
      pathsTraitSets.forEach(pathTraitSets => {
        pathTraitSets.forEach(pathTraitSet => {
          const traitSetName = pathTraitSet.name;
          let targetTraitSet = keyedTraitSets[traitSetName];
          if (!targetTraitSet) {
            targetTraitSet = {name: traitSetName, dice:[], limits:[], sfx:[], notes:[]};
            mergedTraitSets.push(targetTraitSet);
            keyedTraitSets[traitSetName] = targetTraitSet;
          }

          const keyedDice = {};
          targetTraitSet.dice.forEach(die => {
            keyedDice[die.name] = die;
          });
          pathTraitSet.dice.forEach(die => {
            const currentDie = keyedDice[die.name];
            if (currentDie) {
              if (die.die > currentDie.die)
                Object.assign(currentDie, die)
            } else {
              targetTraitSet.dice.push({...die})
            }
          });

          pathTraitSet.limits.forEach(die => targetTraitSet.limits.push({...die}));
          pathTraitSet.sfx.forEach(die => targetTraitSet.sfx.push({...die}));
          pathTraitSet.notes.forEach(die => targetTraitSet.notes.push({...die}));
        })
      });
      return mergedTraitSets;
    },
    [pathsTraitSets]
  );

  const character = {...item, traitSets};
  //console.log('ucbXXX', {character, stepPaths, stepResults, pathsTraitSets, traitSets});
  return character;
}
const CharacterItem = ({firestore, item}) => {
  const character = useCharacterBuilder(firestore, item);
  const [isActive, toggleActive] = useTracksActive().slice(1) // avoid "unused variable: active" warning
  const isOpen = isActive(item.id);
  return <CortexDiv style={{marginTop:'1em'}}>
    <h5 onClick={()=>{ toggleActive(item.id); }} >
      {item.attributes.name}
    </h5>
    <div style={{display:(isOpen ? 'block' : 'none')}}>
      {character.traitSets.map(
        traitSet => <CortexDiv key={traitSet.name} style={{marginTop:'1em'}}>
          <h6><u><b>{traitSet.name}</b></u></h6>
          {traitSet.dice.map(
            (die, idx) => <DieItem key={idx} item={{attributes:die}}/>
          )}
          {traitSet.limits.map(
            (die, idx) => <SFXOrLimit key={idx} category="Limit" item={die}/>
          )}
          {traitSet.sfx.map(
            (die, idx) => <SFXOrLimit key={idx} category="SFX" item={die}/>
          )}
        </CortexDiv>
      )}
    </div>
  </CortexDiv>
}

const Indent = () => <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
const LimitAsMarkup = ({item, firestore}) => (
  <span>
    <br/><Indent/><Indent/><Indent/><Indent/>&#123;name: '{item.attributes.name}', description:'{item.attributes.description}' &#125;,
  </span>
)
const DieAsMarkup = ({item, firestore}) => (
  <span>
    <br/><Indent/><Indent/><Indent/><Indent/>&#123;name: '{item.attributes.name}', die:{item.attributes.die} &#125;,
  </span>
)
const TraitSetAsMarkup = ({item, firestore}) => (
  <span>
    <br/><Indent/><Indent/>&#123;<Indent/>name: '{item.attributes.name}',
    <br/><Indent/><Indent/><Indent/>order: {item.attributes.order},
    <br/><Indent/><Indent/><Indent/>dice: [
    <Collection
     firestore={firestore}
     collectionName={`${item.path}/dice`}
     orderBy={ item.attributes.name === 'Ability Scores' ? 'order' : 'name' }
     CollectionComponent={Span}
     ItemComponent={DieAsMarkup}
    />
    <br/><Indent/><Indent/><Indent/>],
    <br/><Indent/><Indent/><Indent/>limits: [
    <Collection
     firestore={firestore}
     collectionName={`${item.path}/limits`}
     CollectionComponent={Span}
     ItemComponent={LimitAsMarkup}
    />
    <br/><Indent/><Indent/><Indent/>],
    <br/><Indent/><Indent/>&#125;,
  </span>
)
const CharacterAsMarkup = ({item, firestore}) => (
  <span>
    <br/>&#123;<Indent/>name: '{item.attributes.name}',
    <br/><Indent/>traitSets: [
    <Collection
     firestore={firestore}
     collectionName={`${item.path}/traitSets`}
     orderBy="order"
     CollectionComponent={Span}
     ItemComponent={TraitSetAsMarkup}
    />
    <br/><Indent/>]
    <br/>&#125;
  </span>
)

const Die = ({die}) => (
  <div>{(
    die.die === 4
    ? <span>{die.name} d{die.die} {die.description}</span>
    : <span><b>{die.name} d{die.die}</b> {die.description}</span>
  )}</div>
)

const SFXOrLimit = ({category, item}) => (
  <div>
    <b>{category}:</b> <i>{item.name}</i>. {item.description}
  </div>
)

// XXX TODO: notes!
const TraitSet = ({traitSet}) => (
  <CortexDiv style={{marginBottom:'1em'}}>
    <h6><b><u>{traitSet.name}</u></b></h6>
    <div>{traitSet.dice.map((die, idx)=><Die key={idx} die={die}/>)}</div>
    <div>{traitSet.limits.map((item, idx)=><SFXOrLimit key={idx} category="Limit" item={item}/>)}</div>
    <div>{traitSet.sfx.map((item, idx)=><SFXOrLimit key={idx} category="SFX" item={item}/>)}</div>
  </CortexDiv>
)

const StepMarkup = ({markup}) => {
  return (
    <div>
      { markupToTraitSets(markup).map((traitSet, idx)=>(
          <TraitSet key={idx} traitSet={traitSet}/>
        ))
      }
    </div>
  )
}

const markupToTraitSets = markup => {
  const parseSFXOrLimit = (rest, target) => {
    const itemStr = rest.join(':');
    const [sloppyName, ...descriptionChunks] = itemStr.split('.');
    target.push({
      name: sloppyName.trim(),
      description: descriptionChunks.join('.').trim()
    });
  }
  const traitSetChunks = markup ? markup.split('\n\n') : [];
  const traitSets = traitSetChunks.map(
    traitSetChunk => {
      const traitSetLines = traitSetChunk.split('\n').map(s=>s.trim());
      const [name, ...rest] = traitSetLines;
      const dice=[], limits=[], sfx=[], notes=[]
      rest.forEach(line => {
        const [lineType, ...rest] = line.split(':');
        if (lineType === 'Limit') { parseSFXOrLimit(rest, limits) }
        else if (lineType === 'SFX') { parseSFXOrLimit(rest, sfx) }
        else {
          const dieSplits = line.split(/ (d(4|6|8|10|12))/);
          if (dieSplits.length === 1) 
            notes.push(dieSplits[0])
          else  {
            dice.push({
              name: dieSplits[0],
              die: parseInt(dieSplits[1].slice(1)),
              description: dieSplits.slice(3).join('')
            });
          }
        }
      })
      return { name, dice, limits, sfx, notes }
    }
  );
  return traitSets;
}

const GrowingTextarea = ({register, name, ...props}) => {
  const reheight = event => {
    //console.log('rehiehgt');
    event.target.style.height = "1px";
    event.target.style.height = (5+event.target.scrollHeight)+"px";
  }
  //console.log('GTaXXX', {props});
  const registered = register(name);
  return <textarea {...registered} onKeyUp={reheight} style={{height:'100%'}} {...props}/>
}

const StepItem = ({firestore, item, doc}) => {
  item = item || doc;
  const {register, formState, handleSubmit, setFocus, reset} =
    useForm({defaultValues:item.attributes});
  const submit = values => { 
    item.setDoc(values);
    reset({keepValues:true, values:item.attributes}); 
  }
  const {isDirty} = formState

  React.useEffect(
    ()=>setFocus('name'),
    [setFocus]
  )

  return (
    <CortexDiv style={{marginTop:'1em'}}>
      <div>
        <div style={{width:'50%', float:'left', paddingRight:'1em'}}>
          <h5>
            {item.attributes.name}
          </h5>
          <StepMarkup markup={item.attributes.markup}/>
        </div>
        <div style={{width:'50%', float:'left', paddingLeft:'1em'}}>
          <form onSubmit={handleSubmit(submit)}>
            <InputWrapper>
              <input {...register('name')} type="text" placeholder="Name"/>
            </InputWrapper>
            <InputWrapper>
              <GrowingTextarea register={register} 
                name="markup" placeholder="Markup" autoComplete="off"
              />
            </InputWrapper>
            <input type="submit" value="Save" disabled={!isDirty}/>
          </form>
        </div>
        <div style={{clear:'both'}}/>
      </div>
    </CortexDiv>
  )
};

const PathListItem = ({firestore, item}) => {
  const [isActive, toggleActive] = useTracksActive().slice(1) // avoid "unused variable: active" warning
  const isOpen = isActive(item.id);
  return (
    <React.Fragment>
      <CortexDiv style={ isOpen ? {backgroundColor:'transparent'} : {} }>
        <h5 onClick={()=>{ toggleActive(item.id); }} >
          {item.attributes.name}
        </h5>
      </CortexDiv>
      { !isOpen ? null : 
        <Collection
        firestore={firestore}
        collectionName={`${item.path}/steps`}
        CollectionComponent={Div}
        ItemComponent={StepItem}
        />
      }
    </React.Fragment>
  )
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

    <h4>Paths</h4>
    <Collection
     firestore={firestore}
     collectionName={`${doc.path}/paths`}
     CollectionComponent={Div}
     ItemComponent={PathListItem}
    />

    <h4>Steps</h4>
    <Collection
     firestore={firestore}
     collectionName={`${doc.path}/steps`}
     CollectionComponent={Div}
     ItemComponent={StepItem}
    />
  </div>
)

// XXX TODO hardcoded docPath!!!
const GameRoute = ({firestore, ...rest}) => (
  <Doc
   firestore={firestore}
   docPath={'games/IYbx9XbB9eqiAWjUjR3O'}
   DocComponent={GameDoc}
  />
)

export {GamesRoute, GameRoute}
