import {useMemo} from 'react'
import { getFirestore, collection } from 'firebase/firestore';
import { useCollectionData as fbUseCollectionData } from 'react-firebase-hooks/firestore';

const useFirestore = (firebaseApp) => {
  const firestore = useMemo(
    ()=>getFirestore(firebaseApp),
    [firebaseApp]
  )
  return firestore
}

const useCollectionData = (firestore, collectionName) => {
  const [value, loading, error] = fbUseCollectionData(
    collection(firestore, collectionName)
  )
  const items = useMemo(
    () => loading ? [] : value.map(v=>({attributes:v}))
  )
  console.log('uCDXXX', {value, firestore, collectionName})
  return {response:items, ready:!loading, fetching:loading, error}
}

export {useFirestore, useCollectionData}
