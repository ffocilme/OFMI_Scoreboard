import React from 'react';
import logo from '../assets/favicon.ico';
import '../styles/LoadingSpinner.css';

const NotFound = ({ error }) => {
    return (
        <>
            <div className='loading-container'>
                <img src={logo} className="logo react" alt="React logo" />
                <h1>{error}</h1>
            </div>
        </>
    );
};

export default NotFound;
