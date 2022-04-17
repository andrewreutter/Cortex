import {useMemo} from 'react'
import { getFirestore, collection } from 'firebase/firestore';
import { useCollectionData as fbUseCollectionData } from 'react-firebase-hooks/firestore';

const postConverter = {
  toFirestore(post): DocumentData {
    return { author: post.author, title: post.title };
  },
  fromFirestore: (snapshot, options) => ({
    attributes: snapshot.data(options),
    id: snapshot.id,
    ref: snapshot.ref,
  }),
};

const useFirestore = (firebaseApp) => {
  const firestore = useMemo(
    ()=>getFirestore(firebaseApp),
    [firebaseApp]
  )
  return firestore
}

const useCollectionData = (firestore, collectionName) => {
  const [value, loading, error] = fbUseCollectionData(
    collection(firestore, collectionName).withConverter(postConverter)
  )
  console.log('uCDXXX', {value, firestore, collectionName})
  return {response:value, ready:!loading, fetching:loading, error}
}

export {useFirestore, useCollectionData}
