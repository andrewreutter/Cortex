import React from 'react'
import {compose} from 'recompose'
import {Link} from "react-router-dom"
import {useForm} from "react-hook-form";
import {collection, addDoc} from 'firebase/firestore';

import {InputWrapper} from '../../core-lib/ui/forms/components.jsx'
import {CardTitle, CardContent} from '../../core-lib/ui/cards/components.jsx'
import {Button, UL, Span, Div} from '../../core-lib/utils/components.jsx'
import {useTracksActive} from '../../core-lib/ui/hooks.jsx'
import {CortexCard} from '../components.jsx'
import {Collection, Doc} from '../../core-lib/firebase/firestore/components.jsx'
// import {logsRender} from '../../core-lib/utils/higher-order.jsx'
import {addsStyle, addsClassNames} from '../../core-lib/utils/higher-order.jsx'
import {useDocData} from '../../core-lib/firebase/firestore/hooks.jsx'

import {CharacterCard} from '../characters/components.jsx'
import {TraitSet} from '../trait_sets/components.jsx'
import {useTraitSetsFromMarkup} from './hooks.jsx'

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
    <CortexCard style={{marginTop:'1em'}}>{
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
    }</CortexCard>
  )
};

const PathListItem = ({firestore, item}) => {
  const [isActive, toggleActive] = useTracksActive().slice(1) // avoid "unused variable: active" warning
  const isOpen = isActive(item.id);
  const onDelete = () => window.confirm('Are you sure?') ? item.deleteDoc() : true;
  return (
    <React.Fragment>
      <CortexCard style={ isOpen ? {backgroundColor:'transparent'} : {} }>
        <CardTitle>
          <div onClick={()=>{ toggleActive(item.id); }} >
            <Button onClick={onDelete} style={{float:'right'}}>Delete</Button>
            {item.attributes.name}
          </div>
        </CardTitle>
      { !isOpen ? null : 
        <CardContent>
          <Collection
           firestore={firestore}
           collectionName={`${item.path}/steps`}
           orderBy="name"
           CollectionComponent={Div}
           ItemComponent={StepItem}
          />
        </CardContent>
      }
      </CortexCard>
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
     ItemComponent={CharacterCard}
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
