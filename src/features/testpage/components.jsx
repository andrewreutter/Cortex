import React, {useState, useMemo} from 'react'

import {useMakePromise, useMakesPromise} from '../../core-lib/utils/hooks.jsx'

const TestPromiseMaker = ({auto}) => {
  const [counter, setCounter] = useState(0)
  const makePromiseFromCounter = useMemo(()=>{
    return () => new Promise(
      (resolve, reject) => {
        setTimeout(()=>resolve(counter), 3000)
      }
    )
  }, [counter])

  const useIt = auto ? useMakesPromise : useMakePromise
  const {makePromise, ready, busy, result, error} = useIt(makePromiseFromCounter)
  console.log({makePromise, ready, busy, result, error})
  return (
    <div>
      <div>
        <button className="btn" onClick={()=>setCounter(counter+1)}>Increment</button> {counter}
      </div>
      <button className="btn" onClick={()=>makePromise()}>TestPromiseMaker</button>
      <div>ready: {ready ? 'yes' : 'no'}</div>
      <div>busy: {busy ? 'yes' : 'no'}</div>
      {result}
    </div>
  )
}
const SandboxRoute = () => (
  <React.Fragment>
    <TestPromiseMaker/>
    <TestPromiseMaker auto/>
  </React.Fragment>
)

export {SandboxRoute}
