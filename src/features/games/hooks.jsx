import {useMemo} from 'react'

const useTraitSetsFromMarkup = markup => {
  return useMemo(
    ()=>traitSetsFromMarkup(markup),
    [markup]
  );
}
const traitSetsFromMarkup = markup => {
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
            notes.push(line)
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
export {useTraitSetsFromMarkup, traitSetsFromMarkup}
