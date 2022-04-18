import React from 'react'
import {Error, Progress} from '../../ui/components.jsx'
import {useCollectionData, useDocData} from './hooks.jsx'

const DefaultError = ({error}) => <Error>{error.message}: reload to try again</Error>

const Collection = ({
  firestore,
  collectionName,
  LoadingComponent=Progress,
  ErrorComponent=DefaultError,
  EmptyComponent=React.Fragment,
  CollectionComponent,
  ItemComponent,
  orderBy,
  where,
}) => {
  const {response, ready, error} = useCollectionData(firestore, collectionName, {orderBy:orderBy, where:where});
  return !ready
    ? <LoadingComponent/>
    : (
      error
      ? <ErrorComponent error={error}/>
      : (
        !response.length
        ? <EmptyComponent/>
        : <CollectionComponent firestore={firestore} response={response}>
            { response.map(item => <ItemComponent key={item.id} firestore={firestore} item={item}/>)
            }
          </CollectionComponent>
      )
    )
}

const Doc = ({
  firestore, 
  docPath, 
  LoadingComponent=Progress,
  ErrorComponent=DefaultError,
  DocComponent
}) => {
  const {response, ready, error} = useDocData(firestore, docPath);
  return !ready
    ? <LoadingComponent/>
    : (
      error
      ? <ErrorComponent error={error}/>
      : <DocComponent firestore={firestore} doc={response}/>
    )
}

export {Collection, Doc}
