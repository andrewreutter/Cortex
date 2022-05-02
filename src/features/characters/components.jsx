import React from 'react'
import {collection, addDoc} from 'firebase/firestore';

import {Button} from '../../core-lib/utils/components.jsx'
import {CardContent, CardFooter, CardTitle} from '../../core-lib/ui/cards/components.jsx'
import {CortexCard} from '../components.jsx'
import {useTracksActive} from '../../core-lib/ui/hooks.jsx'

import {TraitSet} from '../trait_sets/components.jsx'
import {useCharacterBuilder} from './hooks.jsx'

const CharacterCard = ({firestore, item}) => {
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

  return <CortexCard style={{marginTop:'1em'}}>
    <CardTitle>
      <Button onClick={onDelete} style={{float:'right'}}>Delete</Button>
      <div onClick={()=>{ toggleActive(item.id); }} >
        {item.attributes.name}
      </div>
    </CardTitle>
    <CardContent style={{display:(isOpen ? 'block' : 'none')}}>
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
    </CardContent>
  </CortexCard>
}

export {CharacterCard}
