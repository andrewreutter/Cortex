import {useEffect, useState, useMemo} from 'react'

/*  Returns 'Desktop' or 'Mobile' based on current screen size,
    keeping up with window resizing.
    
    Relies on a <ResponsiveTest/> element being rendered somewhere on the page.
*/
const useFormFactor = () => {
  const sizetest = document.getElementById('sizetest')
  const getFormFactor = useMemo(()=>(
    () => (sizetest || {offsetParent:true}).offsetParent ? 'Desktop' : 'Mobile'
  ), [sizetest])

  const [formFactor, setFormFactor] = useState(getFormFactor())
  useEffect(()=>{
    setInterval(()=>setFormFactor(getFormFactor()), 250)
  }, [getFormFactor])

  return formFactor
}

/*  Provided a real DOM node, return {top, left, height, width, ready},
    using the bounding rectangle of the node.

    If the node is undefined, returns 0,0,0,0 and ready:false.
*/
const useNodeBounds = node => {
  const bounds = useMemo(()=>{
    const {top, left, height, width} = node ? node.getBoundingClientRect() : {top:0, left:0, height:0, width:0}
    return {ready:!!node, top, left, height, width}
  }, [node])
  return bounds
}

export {useFormFactor, useNodeBounds}
