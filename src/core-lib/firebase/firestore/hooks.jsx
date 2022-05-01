import {useState, useMemo, useEffect} from 'react'
import { getFirestore, collection, collectionGroup, doc, getDoc, deleteDoc, setDoc, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import {
  useCollectionData as fbUseCollectionData,
  useDocumentData as fbUseDocData
} from 'react-firebase-hooks/firestore';

const refToPath = ref => ref._key.path.segments.slice(ref._key.path.offset).join('/');

const postConverter = {
  toFirestore: item => item.attributes,
  fromFirestore: (snapshot, options) => {
    const attributes = snapshot.data(options);
    Object.entries(attributes).forEach(([key, val])=>{
      if (val._key) attributes[key] = {ref:val, path:refToPath(val)};
    });
    return ({
      attributes: attributes,
      id: snapshot.id,
      ref: snapshot.ref,
      snapshot: snapshot,
      setDoc: (values) => setDoc(snapshot.ref, values),
      deleteDoc: () => deleteDoc(snapshot.ref),
      path: refToPath(snapshot.ref),
    })
  }
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

const useDocsData = (firestore, docPaths) => {
  const noResults = useMemo(()=>[], []);
  const defaultInternalResults = useMemo(
    () => Array(docPaths.length).fill(0),
    [docPaths]
  );

  const [internalResults, setInternalResults] = useState(defaultInternalResults);
  const [results, setResults] = useState(noResults);

  const onSnap = (snap, idx) => {
    const newInternalResults = [].concat(internalResults);
    setInternalResults(newInternalResults)
    newInternalResults[idx] = snap.data();
    if (!newInternalResults.includes(0)) setResults(newInternalResults);
  };

  useEffect(()=>{
    docPaths.map((docPath, idx) => {
      const stepDoc = doc(firestore, docPath).withConverter(postConverter);
      onSnapshot(stepDoc, {next:snap=>onSnap(snap, idx)});
    });
  }, [docPaths]);
  return results;
}

const useCollectionData = (firestore, collectionName, {isGroup, orderBy:myOrderBy, where:myWhere}={}) => {
  const makeCol = isGroup ? collectionGroup : collection;
  let coll = makeCol(firestore, collectionName).withConverter(postConverter)
  if (myOrderBy) coll = query(coll, orderBy(myOrderBy));
  if (myWhere) coll = query(coll, myWhere);
  /*
  if (myOrderBy && myWhere) {
    coll = query(coll, orderBy(myOrderBy), where(myWhere))
  }
  else if (myOrderBy) {
    coll = query(coll, orderBy(myOrderBy))
  }
  else if (myWhere) {
    coll = query(coll, where(myWhere))
  }
  */

  const [value, loading, error] = fbUseCollectionData(coll)
  //console.log('uCDXXX', {value, firestore, collectionName})
  return {response:value, ready:!loading, fetching:loading, error}
}

export {useFirestore, useCollectionData, useDocData, useDocsData, postConverter}
