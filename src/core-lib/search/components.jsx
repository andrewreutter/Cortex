import React from 'react'
import PropTypes from 'prop-types'
import {compose} from 'recompose'
import {Field, reduxForm} from 'redux-form'

import {Error, Collapsible, Button} from '../ui/components.jsx'
import {InputWrapper, Checkbox} from '../ui/forms/components.jsx'
import {Row, Col, FixFirstChild} from '../ui/layout/components.jsx'
import {useTracksActive} from '../ui/hooks.jsx'
import {useCollectionData} from '../firebase/firestore/hooks.jsx'

import {Form} from '../utils/components.jsx'
import {addsStyle} from '../utils/higher-order.jsx'

//import {useFetches, useJsonApiResponse} from '../fetch/hooks.jsx'
import {ProgressWhenFetching} from '../fetch/components.jsx'

//import {useSearch} from './hooks.jsx'
import {searchDisplay, searchOperations} from './proptypes.jsx'

/*  SearchForm has a single search field available as state.form.searchInNav.search */
const SearchForm = compose(
  reduxForm({form:'searchInNav'}), // provide handleSubmit prop
  addsStyle({display:'inline-block'}),
)(
  ({handleSubmit, className, style, autoFocus}) => (
    <form onSubmit={handleSubmit} {...{className, style}}>
      <InputWrapper inline style={{width:'100%'}}>
        <Field {...{autoFocus}} name="search" component="input" type="text" placeholder="Search..."/>
      </InputWrapper>
    </form>
  )
)
SearchForm.propTypes = {
  ...Form.propTypes,
  autoFocus: PropTypes.bool,
}

/*  <SearchHeader/> is everything above the actual list of results,
    like the progress indicator, multi-selector, and action buttons.

    We use a (flat) Collapsible to ensure alignment with SearchResults.
*/
const SearchHeader = ({
  fetching, hasData, hasSelected, toggleAll,
  searchOperations: {selectedOperations, globalOperations},
}) => {
  return (
    <React.Fragment>
      <ProgressWhenFetching {...{fetching}}/>
    { !hasData ? null : (
            !(selectedOperations.length || globalOperations.length)
            ? null
            : (
              <Collapsible flat compact style={{marginTop:0, marginBottom:0}}
                items={['opsbar']}
                id={item=>item}
                Header={({item})=>(
                  <Row compact>
                    <Col s={9}>
                    { !selectedOperations.length ? null : (
                      <React.Fragment>
                        <Checkbox checked={hasSelected} onChange={toggleAll}/>
                        { selectedOperations.map(so=>(
                            <Button key={so.name} size="small" disabled={!hasSelected}>
                              {so.name} selected
                            </Button>
                          )
                        )}
                      </React.Fragment>
                    )}
                    </Col>
                    <Col s={3}>
                    { !globalOperations.length ? null : (
                      globalOperations.map(go=>(
                        <Button key={go.name} size="small" className="right" style={{marginRight:'-1em'}}>
                          {go.name}
                        </Button>
                      ))
                    )}
                    </Col>
                  </Row>
                )}
              />
            )
    )}
    </React.Fragment>
  )
}
SearchHeader.propTypes = {
  fetching: PropTypes.bool,               // so we can show progress indicator while fetching new data.
  hasData: PropTypes.bool.isRequired,     // so we can wait to show operations until we're loaded.
  hasSelected: PropTypes.bool.isRequired, // are any results currently selected?
  toggleAll: PropTypes.func.isRequired,   // fn() that [de]selects all results.
  searchOperations: searchOperations.isRequired,
}

/*  Actual list of search results, using a searchDisplay spec.
*/
const SearchResults = ({
  items, isActive, toggleActive,
  itemRoutes, // optional; we use a list instead of a 
  searchDisplay:{Body, H1, H2},
  searchOperations:{selectedOperations},
}) => (
  <Collapsible flat
    items={items}
    id={item=>item.id}
    Body={Body}
    Header={({item, active})=>(
      <Row compact>
        <Col s={12} l={3} className="truncate">
          { !selectedOperations.length ? null : (
            <Checkbox checked={isActive(item.id)} onChange={()=>toggleActive(item.id)}/>
          )}
          <H1 {...{item, active}}/>
        </Col>
        <Col s={12} l={9}>
          <div style={selectedOperations.length ? {paddingLeft:'35px'} : {}}>
            <H2 {...{item, active}}/>
          </div>
        </Col>
      </Row>
    )}
  />
)
SearchResults.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,  // search results
  searchDisplay: searchDisplay.isRequired,                // display spec
  searchOperations: searchOperations.isRequired,          // operations spec, so we can [en/dib]able selection
  isActive: PropTypes.func.isRequired,                    // (itemId) => bool for whether an item is selected
  toggleActive: PropTypes.func.isRequired,                // (itemId) => {...[un]select an item by id}
}

/*  Main content for a search page, including a header and results.
    Ties to page-level search element to run searches when the search string changes.
*/
const defaultFetchOptions = {} // lifted out of SearchInterface to avoid identity changes.
const WhiteFixFirstChild = props => <FixFirstChild {...props} fixedStyle={{backgroundColor:'white'}}/>
const SearchInterface = ({
  fixedHeader,
  //searchToUrl,
  //fetchOptions=defaultFetchOptions,
  searchDisplay,
  searchOperations,
  firestore,
  collectionName,
}) => {
  //const {endpoint} = useSearch(searchToUrl)
  const {fetch, ready, response:items, itemIds, error} = useCollectionData(firestore, collectionName)
  //const {responseItems:items, responseItemIds:itemIds} = useJsonApiResponse(response)
  const [active, isActive, toggleActive, toggleAll] = useTracksActive()
  const Wrapper = fixedHeader ? WhiteFixFirstChild : React.Fragment
  return (
    <Wrapper>
      <SearchHeader {...{fetching:!ready, searchOperations}}
        hasData={ready} hasSelected={!!active.length}
        toggleAll={()=>toggleAll(itemIds)}
      />
      { !ready
        ? 'Loading search results...'
        : (
          error
          ? <Error onClick={()=>fetch(true)}>{error.message}: click to try again</Error>
          : <SearchResults {...{items, searchDisplay, searchOperations, isActive, toggleActive}}/>
        )
      }
    </Wrapper>
  )
}
SearchInterface.defaultProps = {
  fixedHeader: true,
}
SearchInterface.propTypes = {
  //fetchOptions: PropTypes.object.isRequired,      // be careful not to change the identity of these options!
  searchDisplay: searchDisplay.isRequired,        // display spec; see proptypes.jsx
  searchOperations: searchOperations.isRequired,  // operations spec; see proptypes.jsx
  fixedHeader: PropTypes.bool.isRequired,         // should the header be fixed?
  firestore: PropTypes.shape({}).isRequired,      // XXX document or remove
  collectionName: PropTypes.string.isRequired,    // XXX document
}

export {SearchForm, SearchInterface}
