import {useMemo} from 'react'
import {where} from 'firebase/firestore';
import {useDocsData, useCollectionData} from '../../core-lib/firebase/firestore/hooks.jsx'
import {traitSetsFromMarkup} from '../games/hooks.jsx'

const useCharacterSteps = (firestore, item) => {
  return useCollectionData(firestore, `${item.path}/steps`);
}
const useCharacterStepPaths = (firestore, item) => {
  const {response:steps, ready} = useCharacterSteps(firestore, item);
  const stepPaths = useMemo(
    () => ready ? steps.map(step=>step.attributes.stepRef.path) : [],
    [ready, steps]
  );
  return stepPaths;
}
const useTraitSetsFromItemsWithMarkup = (itemsWithMarkup) => {
  return useMemo(
    () => (//console.log('uTSfIWM', {itemsWithMarkup}),
      !itemsWithMarkup
      ? []
      : itemsWithMarkup.map(
          item => traitSetsFromMarkup(item.attributes.markup)
        ).flat()
    ),
    [itemsWithMarkup]
  );
}

const useMergeTraitSets = traitSets => useMemo(
  () => {
    const mergedTraitSets = [], keyedTraitSets = {};
      traitSets.forEach(traitSet => {
        const traitSetName = traitSet.name;
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
        traitSet.dice.forEach(die => {
          const currentDie = keyedDice[die.name];
          if (currentDie) {
            if (die.die > currentDie.die)
              Object.assign(currentDie, die)
          } else {
            targetTraitSet.dice.push({...die})
          }
        });

        traitSet.limits.forEach(die => targetTraitSet.limits.push({...die}));
        traitSet.sfx.forEach(die => targetTraitSet.sfx.push({...die}));
        traitSet.notes.forEach(note => targetTraitSet.notes.push(note));
      });
    return mergedTraitSets;
  },
  [traitSets]
);

const useAvailableSteps = (firestore, stepPaths) => {
  // XXX TODO: finish making a list of available steps work.
  const noSteps = useMemo(()=>[]);
  const {ready, response} = 
    useCollectionData(firestore, 'steps', {
      isGroup:true,
      //orderBy:'name',
      where: stepPaths.length ? where('prerequisite', 'in', stepPaths) : null,
    });
  //console.log('uAS - useAvailableSteps', stepPaths, ready ? response : noSteps);
  return ready ? response : noSteps;
}

/* Take a character doc and elaborate it. */
const useCharacterBuilder = (firestore, item) => {

  const characterSteps = useCharacterSteps(firestore, item);
  const stepPaths = useCharacterStepPaths(firestore, item);
  const stepDocs = useDocsData(firestore, stepPaths);
  const traitSets = useTraitSetsFromItemsWithMarkup(stepDocs);
  const mergedTraitSets = useMergeTraitSets(traitSets);
  const availableSteps = useAvailableSteps(firestore, stepPaths);

  const character = {
    ...item, 
    traitSets:mergedTraitSets, 
    characterSteps,
    availableSteps,
    stepPaths,
    stepDocs
  };
  //console.log('ucbXXX', {character});
  return character;
}

export {useCharacterBuilder}
