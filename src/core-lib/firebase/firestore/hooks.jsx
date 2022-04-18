import {useMemo} from 'react'
import { getFirestore, collection, doc, query, orderBy, where } from 'firebase/firestore';
import {
  useCollectionData as fbUseCollectionData,
  useDocumentData as fbUseDocData
} from 'react-firebase-hooks/firestore';

const postConverter = {
  toFirestore: item => item.attributes,
  fromFirestore: (snapshot, options) => ({
    attributes: snapshot.data(options),
    id: snapshot.id,
    ref: snapshot.ref,
    path: snapshot.ref._key.path.segments.slice(snapshot.ref._key.path.offset).join('/')
  }),
};

const useFirestore = (firebaseApp) => {
  const firestore = useMemo(
    ()=>getFirestore(firebaseApp),
    [firebaseApp]
  )
  return firestore
}

const useDocData = (firestore, docPath) => {
  const [value, loading, error] = fbUseDocData(
    doc(firestore, docPath).withConverter(postConverter)
  )
  //console.log('uCDXXX', {value, firestore, collectionName})
  return {response:value, ready:!loading, fetching:loading, error}
}

const defaultCollectionProcessor = collection => collection;
const useCollectionData = (firestore, collectionName, {orderBy:myOrderBy}={}) => {
  let coll = collection(firestore, collectionName).withConverter(postConverter)
  if (myOrderBy) coll = query(coll, orderBy(myOrderBy))

  const [value, loading, error] = fbUseCollectionData(coll)
  //console.log('uCDXXX', {value, firestore, collectionName})
  return {response:value, ready:!loading, fetching:loading, error}
}

export {useFirestore, useCollectionData, useDocData}
