import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "react-query";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Contest from "./components/Contest.jsx";
import SplitContest from "./components/SplitContest.jsx";
import StackComponent from "./components/StackComponent.jsx";
import FullScreenButton from "./components/FullScreenButton.jsx";
import ThemeToggleButton from "./components/ThemeToggleButton";
import { lightTheme, darkTheme } from "./utils/Themes.jsx";
import FeaturedContests from "./components/FeaturedContests.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import basename from "./utils/basename.jsx";
import NotFound from "./components/NotFound.jsx";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/scoreboards",
    element: <SplitContest />,
  },
  {
    path: "/contest",
    element: <Contest />,
  },
  {
    path: "/contest/:id",
    element: <Contest />,
  },
  {
    path: "/contest/admin/:id",
    element: <Contest admin={true} />,
  },
  {
    path: "/merge",
    element: <StackComponent />,
  },
  {
    path: "*",
    element: <NotFound error="404 - Página no encontrada" />,
  },
], { basename: basename || "/" });

function WrappedApp() {
  const [darkMode, setDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const currentTheme = darkMode ? darkTheme : lightTheme;

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={currentTheme}>
          <Toolbar>
            <div style={{ flexGrow: 1 }} />
            <ThemeToggleButton
              theme={currentTheme}
              toggleTheme={toggleDarkMode}
              isDarkMode={darkMode}
            />

            <FullScreenButton />
          </Toolbar>

          <RouterProvider router={router}></RouterProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </>
  );
}

// Renderiza tu aplicación
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WrappedApp />
  </React.StrictMode>
);
