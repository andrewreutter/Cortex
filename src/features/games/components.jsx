import React from 'react'
import {compose} from 'recompose'
import {Link} from "react-router-dom"
import {useForm} from "react-hook-form";
import {collection, addDoc} from 'firebase/firestore';

import {InputWrapper} from '../../core-lib/ui/forms/components.jsx'
import {Button, UL, Span, Div} from '../../core-lib/utils/components.jsx'
import {useTracksActive} from '../../core-lib/ui/hooks.jsx'
import {Card} from '../../core-lib/ui/cards/components.jsx'
import {Collection, Doc} from '../../core-lib/firebase/firestore/components.jsx'
// import {logsRender} from '../../core-lib/utils/higher-order.jsx'
import {addsStyle, addsClassNames} from '../../core-lib/utils/higher-order.jsx'
import {useDocData} from '../../core-lib/firebase/firestore/hooks.jsx'

import {useCharacterBuilder, useTraitSetsFromMarkup} from './hooks.jsx'

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

const CharacterItem = ({firestore, item}) => {
  const character = useCharacterBuilder(firestore, item);

  const [isActive, toggleActive] = useTracksActive().slice(1) // avoid "unused variable: active" warning
  const isOpen = isActive(item.id);

  const onDelete = () => window.confirm('Are you sure?') ? item.deleteDoc() : true;
  const addStep = availableStep => {
    if (character.stepPaths.includes(availableStep.path)) {
      // XXX TODO: bug here that requires refreshing; probably in useDocsData()
      character.characterSteps.forEach(characterStep=>{
        if (characterStep.attributes.stepRef.path === availableStep.path) 
          characterStep.deleteDoc();
      })
    } else {
      const newSteps = collection(firestore, `${item.path}/steps`);
      addDoc(newSteps, {stepRef:availableStep.ref});
    }
  }

  return <CortexDiv style={{marginTop:'1em'}}>
    <h5 onClick={()=>{ toggleActive(item.id); }} >
      <Button onClick={onDelete} style={{float:'right'}}>Delete</Button>
      {item.attributes.name}
    </h5>
    <div style={{display:(isOpen ? 'block' : 'none')}}>
      <div style={{float:'right'}}>
        { character.availableSteps.map((availableStep, idx) => (
            <div key={idx}>
              <Button style={{marginTop:'1em'}} onClick={()=>addStep(availableStep)}>
                { character.stepPaths.includes(availableStep.path)
                  ? <span>-</span>
                  : <span>+</span>
                }
                &nbsp;
                {availableStep.attributes.name}
              </Button>
            </div>
          ))
        }
      </div>
      { character.traitSets.map((traitSet, idx)=>(
          <TraitSet key={idx} traitSet={traitSet}/>
        ))
      }
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
const Note = ({note}) => ( <div> <i>Note: {note}</i> </div> )

// XXX TODO: notes!
const TraitSet = ({traitSet}) => (
  <div style={{marginBottom:'1em'}}>
    <h6><b><u>{traitSet.name}</u></b></h6>
    <div>{traitSet.notes.map((note, idx)=><Note key={idx} note={note}/>)}</div>
    <div>{traitSet.dice.map((die, idx)=><Die key={idx} die={die}/>)}</div>
    <div>{traitSet.limits.map((item, idx)=><SFXOrLimit key={idx} category="Limit" item={item}/>)}</div>
    <div>{traitSet.sfx.map((item, idx)=><SFXOrLimit key={idx} category="SFX" item={item}/>)}</div>
  </div>
)

const StepMarkup = ({markup}) => {
  const traitSets = useTraitSetsFromMarkup(markup);
  return (
    <div>
      { traitSets.map((traitSet, idx)=>(
          <TraitSet key={idx} traitSet={traitSet}/>
        ))
      }
    </div>
  )
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

const PrerequisiteDoc = ({firestore, doc}) => {
  return <h6>Prerequisite: {doc.attributes.name}</h6>
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

  const [isActive, toggleActive] = useTracksActive().slice(1)
  const isOpen = isActive(item.id);

  // TODO: doesn't seem to work.
  React.useEffect(
    ()=>isOpen ? setFocus('name') : undefined,
    [setFocus, isOpen]
  );

  //console.log('StepItem', {item});
  return (
    <CortexDiv style={{marginTop:'1em'}}>{
    !isOpen
    ? <h5 onClick={()=>toggleActive(item.id)}>{item.attributes.name}</h5>
    : <div>
        <div style={{width:'50%', float:'left', paddingRight:'1em'}}>
          <h5 onClick={()=>toggleActive(item.id)}>
            {item.attributes.name}
          </h5>
          { item.attributes.prerequisite
            && <Doc
                firestore={firestore}
                docPath={item.attributes.prerequisite}
                DocComponent={PrerequisiteDoc}
               />
          }
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
    }</CortexDiv>
  )
};

const PathListItem = ({firestore, item}) => {
  const [isActive, toggleActive] = useTracksActive().slice(1) // avoid "unused variable: active" warning
  const isOpen = isActive(item.id);
  const onDelete = () => window.confirm('Are you sure?') ? item.deleteDoc() : true;
  return (
    <React.Fragment>
      <CortexDiv style={ isOpen ? {backgroundColor:'transparent'} : {} }>
        <h5 onClick={()=>{ toggleActive(item.id); }} >
          <Button onClick={onDelete} style={{float:'right'}}>Delete</Button>
          {item.attributes.name}
        </h5>
      { !isOpen ? null : 
        <Collection
        firestore={firestore}
        collectionName={`${item.path}/steps`}
        orderBy="name"
        CollectionComponent={Div}
        ItemComponent={StepItem}
        />
      }
      </CortexDiv>
    </React.Fragment>
  )
}
const PathCreator = ({firestore, gameDoc}) => {
  const [isActive, toggleActive] = useTracksActive().slice(1)
  const isOpen = isActive(gameDoc.key);

  const collectionName=`${gameDoc.path}/paths`;
  const col = collection(firestore, collectionName);

  const {register, formState, handleSubmit, setFocus, reset} =
    useForm({defaultValues:{numPaths:10}});

  const averageJamie = useAverageJamie(firestore);
  //console.log('pcXXX', averageJamie && averageJamie.path);

  const submit = values => { 
    const {name, numPaths} = values;
    addDoc(col, {name})
    .then(newPath=>{
      if (numPaths) {
        const newSteps = collection(firestore, `${newPath.path}/steps`);
        let stepNumber = 1, lastDoc = {path:averageJamie.path};
        const doOne = () => {
          if (stepNumber <= numPaths) {

            const newValues = {name:`${name} ${stepNumber}`, markup:''};
            if (lastDoc) newValues.prerequisite = lastDoc.path;
            //console.log('doOneXXX', {name, stepNumber, newValues});

            addDoc(newSteps, newValues)
            .then(newDoc=>{
              stepNumber += 1;
              lastDoc = newDoc;
              doOne();
            });
          }
        };
        doOne();
      }
    });
    reset();
  }
  const {isDirty} = formState

  React.useEffect(
    ()=>isOpen ? setFocus('name') : undefined,
    [setFocus, isOpen]
  )
  return (
    <form onSubmit={handleSubmit(submit)}>
    { !isOpen
      ? <Button style={{marginTop:'2rem'}} onClick={()=>toggleActive(gameDoc.key)}>Create</Button>
      : <React.Fragment>
          <span>Create path named </span>
          <InputWrapper inline>
            <input {...register('name', {validate:value => (!!value)})} type="text" placeholder="Name"/>
          </InputWrapper>
          &nbsp; with &nbsp;
          <InputWrapper inline>
            <input {...register('numPaths')} type="number" placeholder=""
             style={{width:'2em'}}
            />
          </InputWrapper>
          &nbsp; steps. &nbsp;
          <input type="submit" value="Create" disabled={!isDirty}/>
          <Button onClick={()=>toggleActive(gameDoc.key)}>Cancel</Button>
        </React.Fragment>
    }
    </form>
  );
}
const useAverageJamie = firestore => {
  const {response:averageJamie} = useDocData(firestore, '/games/IYbx9XbB9eqiAWjUjR3O/paths/N4JveLQK2EET9Qk2llZC/steps/JCxZvSJEKlJhafiSsDv9');
  // XXX TODO: put averageJamie data somewhere better.
  return averageJamie
}
const CharacterCreator = ({firestore, gameDoc}) => {
  const [isActive, toggleActive] = useTracksActive().slice(1)
  const isOpen = isActive(gameDoc.key);

  const collectionName=`${gameDoc.path}/characters`;
  const col = collection(firestore, collectionName);

  const {register, formState, handleSubmit, setFocus, reset} =
    useForm({defaultValues:{}});

  const averageJamie = useAverageJamie(firestore);

  const submit = values => { 
    const {name} = values;
    addDoc(col, {name})
    .then(newCharacter=>{
      const newSteps = collection(firestore, `${newCharacter.path}/steps`);
      addDoc(newSteps, {stepRef:averageJamie.ref});
    });
    reset();
  }
  const {isDirty} = formState

  React.useEffect(
    ()=>isOpen ? setFocus('name'): undefined,
    [setFocus, isOpen]
  )
  return (
    <form onSubmit={handleSubmit(submit)}>
    { !isOpen
      ? <Button style={{marginTop:'2rem'}} onClick={()=>toggleActive(gameDoc.key)}>Create</Button>
      : <React.Fragment>
          <span>Create character named </span>
          <InputWrapper inline>
            <input {...register('name', {validate:value => (!!value)})} type="text" placeholder="Name"/>
          </InputWrapper>
          <input type="submit" value="Create" disabled={!isDirty}/>
          <Button onClick={()=>toggleActive(gameDoc.key)}>Cancel</Button>
        </React.Fragment>
    }
    </form>
  );
}

const GameDoc = ({firestore, doc}) => (
  <div style={{padding:'0 2em 2em'}}>
    <h3>{doc.attributes.name}</h3>

    <div style={{float:'right', margin:'-1rem 0 0 0'}}>
      <CharacterCreator
       firestore={firestore}
       gameDoc={doc}
      />
    </div>
    <h4>
      Characters
    </h4>
    <div style={{clear:'both'}}/>
    <Collection
     firestore={firestore}
     collectionName={`${doc.path}/characters`}
     CollectionComponent={Div}
     ItemComponent={CharacterItem}
    />

    <div style={{float:'right', margin:'-1rem 0 1rem 0'}}>
      <PathCreator
       firestore={firestore}
       gameDoc={doc}
      />
    </div>
    <h4>Paths</h4>
    <Collection
     firestore={firestore}
     collectionName={`${doc.path}/paths`}
     CollectionComponent={Div}
     ItemComponent={PathListItem}
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
