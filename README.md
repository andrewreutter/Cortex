This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Custom Code

Modifications and additions to the vanilla app are found in:

  * package.json, package-lock.json: contains additional libraries used in this app.
  * src
    * index.js: defines the top-level Redux reducer.
    * App.js: imports CSS resources and defines the application entry point and routes.
    * core-lib: general Lionsoft libraries for use in building React apps.
      * apis: code for acting as an HXR client.
      * auth: authentication and authorization.
      * routing: code related to react-router and overall page navigation.
      * ui: reusable components, including wrappers for Materialize.css components.
      * utils: generic React functionality.
    * features: WGS-specific application code.
      * auth: authentication and authorization.
      * users: the Users page and User-related components
      * assignments: the Assignments page and Assignment-related components

## React Standards

### Feature modules

Code in the src/core-lib and src/features directories is organized into feature modules
to make it easy to find all related code. Each feature module will typically contain:

  * functions.jsx: utility functions
  * components.jsx: React components.
  * hooks.jsx: React hooks for use in functional components.
  * higher-order.jsx: Higher-order components that can be used to decorate rendering components.
  * proptypes.jsx: custom proptypes

### Component Patterns

Components and functionality have been built with preference for the following patterns,
in the order listed:

1. Stateless, functional rendering components: the ideal component is a function that accepts
props and returns a DOM element,
e.g. `const MyComponent = ({name, children}) => <div><h1>{name}</h1>{children}</div>`
1. [React Hooks](https://reactjs.org/docs/hooks-intro.html) let you use local component state
and implement behaviors without resorting to a class-based component.
1. [Higher Order Components](https://reactjs.org/docs/higher-order-components.html) let you
define reusable logic, and subsequently "wrap" rendering components to add behaviors, etc.
We use the _compose_ function from the [recompose](https://github.com/acdlite/recompose) npm module to make more complex HOCs readable.
For example, the following component is a div with a couple of classnames and styles added:
_Note_: some might say this is going a bit HOC-crazy; why not just put the classes/styles in the rendering
component? Well, addsClassNames() deals with adding a class but still allowing another to be passed in,
and addsStyle() will merge the added styles with any passed in by the caller. The second example
illustrates what it would take to do this without HOCs. Repeat that for a dozen components, and see
how many of them forget to support having additional classes and styles passed in...DRY code is best code.

    ```
    const Error = compose(
      addsClassNames('red lighten-3'),
      addsStyle({borderRadius:'.4em', padding:'0 .4em'}),
    )(Div)

    const Error = ({className, style, ...props}) => {
      finalClasses = classNames(className, 'red lighten-3') // using classnames npm module...
      finalStyle = {borderRadius:'.4em', padding:'0 .4em', ...style}
      return <div {...props} className={finalClasses} style={finalStyle}/>
    }
    ```

1. Stateful, class-based components have been completely avoided.

## Custom Scripts

In the project directory, you can run:

### `npm run build`

Builds the app for production to the `build` folder.<br>
Copies its contents to ../WGSAppServer/web-client-build/ to be served by the App/API server.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Standard Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
