import React, { createContext } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/reset.css'
import userStore from './store/userStore'
import { MediaZoomProvider } from './Context/MediaZoomContext';

export const Context = createContext(null)



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <MediaZoomProvider >
        <Context.Provider value={{
            user : new userStore(),
        }}>
            <App />
        </Context.Provider>
    </MediaZoomProvider>
);

