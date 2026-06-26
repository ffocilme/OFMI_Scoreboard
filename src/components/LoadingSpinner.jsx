import React from 'react';
import logo from '../assets/favicon.ico';
import '../styles/LoadingSpinner.css';

const LoadingSpinner = () => {
    return (
        <div className='loading-container'>
            <img src={logo} className="logo react" alt="React logo" />
        </div>
    );
};

export default LoadingSpinner;
