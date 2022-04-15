import React from 'react'
import PropTypes from 'prop-types'
import {Field, reduxForm} from 'redux-form'
import {useSelector} from 'react-redux'
import {compose} from 'recompose'

import {A} from '../utils/components.jsx'
import {Button, Icon, Error} from '../ui/components.jsx'
import {InputWrapper} from '../ui/forms/components.jsx'
import {Card, CardContent, CardFooter} from '../ui/cards/components.jsx'
import {Center} from '../ui/layout/components.jsx'
import {addsProps, removesProps} from '../utils/higher-order.jsx'

/*  SignInForm is a Card for signing in. It takes a single property:
    signIn(username, password): a function for signing in.
*/
const SignInForm = compose(
  Component => (
    ({useSignIn, ...props}) => {
      const {username, password} = useSelector(state=>{
        return ((state.form || {}).signIn || {}).values || {}
      })
      const signIn = useSignIn(username, password)
      return <Component {...{signIn}} {...props}/>
    }
  ),
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
)(
  ({handleSubmit, pristine, submitting, invalid, error, style={}, ...props}) => {
    return (
      <form onSubmit={handleSubmit}>
        <Card style={{width:'20em', ...style}}>
          <CardContent>
            { !error ? null : <Error>{error}</Error> }
            <InputWrapper>
              <Field name="username" component="input" type="text" placeholder="Username" autoComplete="off"/>
            </InputWrapper>
            <InputWrapper>
              <Field name="password" component="input" type="password" placeholder="Password" autoComplete="off"/>
            </InputWrapper>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={pristine || invalid || submitting} style={{width:'100%'}}>
              Sign In <Icon right>send</Icon>
            </Button>
            <Center style={{marginTop:'.4em'}}>
              For help, <A href="mailto:phillip@acdistribution.net">email the admin</A>
            </Center>
          </CardFooter>
        </Card>
      </form>
    )
  }
)
SignInForm.propTypes = {
  useSignIn: PropTypes.func.isRequired, // (username, password) => fn()
}

export {SignInForm}
