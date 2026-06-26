import "./App.css";
import { Link, Outlet } from "react-router-dom";
import Toolbar from "@mui/material/Toolbar";
import ThemeToggleButton from "./components/ThemeToggleButton";
import FeaturedContests from "./components/FeaturedContests";

function App() {
  return (
    <>
      <FeaturedContests />
    </>
  );
}

export default App;
