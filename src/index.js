import React from 'react';
import {createStore, combineReducers} from 'redux'
import {Provider} from 'react-redux'
import ReactDOM from 'react-dom';
import './index.css';

import App from './App';
import * as serviceWorker from './serviceWorker';

import { reducer as formReducer } from 'redux-form'

import {ResponsiveTest} from './core-lib/ui/layout/components.jsx'

const store = createStore(combineReducers({
  form: formReducer,
}))
window.store = store
ReactDOM.render((
    <Provider store={store}>
      <App/>
      <ResponsiveTest/>
    </Provider>
  ),
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
