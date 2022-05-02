import React from 'react'

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

const TraitSet = ({traitSet}) => (
  <div style={{marginBottom:'1em'}}>
    <h6><b><u>{traitSet.name}</u></b></h6>
    <div>{traitSet.notes.map((note, idx)=><Note key={idx} note={note}/>)}</div>
    <div>{traitSet.dice.map((die, idx)=><Die key={idx} die={die}/>)}</div>
    <div>{traitSet.limits.map((item, idx)=><SFXOrLimit key={idx} category="Limit" item={item}/>)}</div>
    <div>{traitSet.sfx.map((item, idx)=><SFXOrLimit key={idx} category="SFX" item={item}/>)}</div>
  </div>
)

export {TraitSet}
