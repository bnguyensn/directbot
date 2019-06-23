import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './global.css';

ReactDOM.render(<App />, document.getElementById('root'));

// Debug - The constant DEFINEPLUGIN.DEVMODE is injected by webpack's
// DefinePlugin. See the webpack config file.
if (DEFINEPLUGIN_DEVMODE) {
  console.log('Application running in development mode.');
}

// Initialise webpack Hot Module Replacement
// This is only relevant for development runs.
if (module.hot) {
  module.hot.accept('./index.js', () => {
    const Next = require('./App');
    ReactDOM.render(<Next />, document.getElementById('root'));

    console.log('webpack Hot Module Replacement updated successfully!');
  });
}

// Should only do in production mode and if we have a service worker file.
if ('serviceWorker' in navigator && DEFINEPLUGIN_SERVICEWORKER) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}
