import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles/global.css';

ReactDOM.render(<App />, document.getElementById('root'));

// Initialise webpack Hot Module Replacement
// This is only relevant for development runs.
if (module.hot) {
  module.hot.accept('./index.js', () => {
    const Next = require('./App');
    ReactDOM.render(<Next />, document.getElementById('root'));

    console.log('webpack Hot Module Replacement updated successfully!');
  });
}
