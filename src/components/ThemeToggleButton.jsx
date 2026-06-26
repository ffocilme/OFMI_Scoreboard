import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

function ThemeToggleButton({ theme, toggleTheme, isDarkMode }) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Toolbar>
                <div style={{ flexGrow: 1 }} />
                <IconButton color="inherit" onClick={toggleTheme} style={{ fontSize: '2rem' }}>
                    {isDarkMode ? <Brightness7Icon fontSize="large" /> : <Brightness4Icon fontSize="large" />}
                </IconButton>
            </Toolbar>
        </ThemeProvider>
    );
}

export default ThemeToggleButton;
