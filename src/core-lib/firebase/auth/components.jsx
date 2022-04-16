import React from 'react'
import PropTypes from 'prop-types'
//import {Field, reduxForm} from 'redux-form'
import {useSelector} from 'react-redux'
import {compose} from 'recompose'

import {useAuthenticator} from './hooks.jsx'

//import {A} from '../../utils/components.jsx'
import {Button, Icon, Error} from '../../ui/components.jsx'
//import {InputWrapper} from '../../ui/forms/components.jsx'
import {Card, CardContent, CardFooter} from '../../ui/cards/components.jsx'
import {Center} from '../../ui/layout/components.jsx'
//import {addsProps, removesProps} from '../../utils/higher-order.jsx'

/*  SignInForm is a Card for signing in. It takes a single property: firebaseApp
*/
const SignInForm = compose(
  Component => (
    ({authenticator, ...props}) => {
      const {username, password} = useSelector(state=>{
        return ((state.form || {}).signIn || {}).values || {}
      })
      return <Component {...{authenticator, username, password}} {...props}/>
    }
  ),
  /*
  addsProps(({signIn})=>({
    onSubmit: (values, dispatch)=>signIn(values.username, values.password), // satisfies redusForm()
  })),
  removesProps('signIn'),
  reduxForm({
    form:'signIn',
    validate: values => {
      const errors = {}
      if (!values.username) errors.username = 'Username is required'
      if (!values.password) errors.password = 'Password is required'
      return errors
    }
  }),
  */
)(
  ({authenticator, handleSubmit, pristine, submitting, invalid, error, style={}, ...props}) => {
    return (
      <form>
        <Card style={{width:'20em', ...style}}>
          <CardContent>
            { !error ? null : <Error>{error}</Error> }
            <Button disabled={submitting} style={{width:'100%'}}
	     onClick={()=>authenticator.signInWith('Google')}
	    >
              Sign In With Google <Icon right>send</Icon>
            </Button>
          </CardContent>
          <CardFooter>
            <Center style={{marginTop:'.4em'}}>
              For help, ask Drew.
            </Center>
          </CardFooter>
        </Card>
      </form>
    )
  }
)
SignInForm.propTypes = {
  authenticator: PropTypes.object.isRequired, // (service) => fn()
}

export {SignInForm}
