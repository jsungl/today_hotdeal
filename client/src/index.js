import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './modules/index';
//import { CookiesProvider } from 'react-cookie';
//import store from './modules/store';
axios.defaults.withCredentials = true;
console.log('=========index Component Rendering=========');


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    
    <BrowserRouter>
        <Provider store={store}>
            <App />
        </Provider>
    </BrowserRouter>
    
);

