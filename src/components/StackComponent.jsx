import React, { useState } from "react";
import {
  Button,
  TextField,
  Grid,
  Typography,
  IconButton,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import MedalSelector from "./MedalSelector.jsx";
import basename from "../utils/basename.jsx";

const StackComponent = () => {
  const [inputValue, setInputValue] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [stack, setStack] = useState([]);
  const [scoreboardTitle, setScoreboardTitle] = useState("");
  const [gold, setGoldThreshold] = useState(1);
  const [silver, setSilverThreshold] = useState(2);
  const [bronze, setBronzeThreshold] = useState(3);
  const [criteria, setMedalCriterion] = useState("place");
  const [diploma, setDiploma] = useState(false);
  const [diplomaCriteria, setDiplomaCriteria] = useState("points");
  const [minScore, setMinScore] = useState(0);

  const handleThresholdsChange = (
    _criteria,
    _gold,
    _silver,
    _bronze,
    _diploma,
    _diplomaCriteria,
    _minScore
  ) => {
    setMedalCriterion(_criteria);
    setGoldThreshold(_gold);
    setSilverThreshold(_silver);
    setBronzeThreshold(_bronze);
    setDiploma(_diploma);
    setDiplomaCriteria(_diplomaCriteria);
    setMinScore(_minScore);
  };

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleAdminToggle = () => {
    setIsAdmin(!isAdmin);
  };

  const handleAdd = () => {
    if (inputValue.trim() !== "") {
      const value = inputValue;
      setStack([...stack, inputValue]);
      setInputValue("");
    }
  };

  const handleEdit = (index) => {
    const newValue = prompt("Ingrese un nuevo valor:", stack[index]);
    if (newValue !== null && newValue.trim() !== "") {
      const updatedStack = [...stack];
      const value = newValue;
      updatedStack[index] = newValue;
      setStack(updatedStack);
    }
  };

  const handleDelete = (index) => {
    const updatedStack = [...stack];
    updatedStack.splice(index, 1);
    setStack(updatedStack);
  };

  const handleClear = () => {
    setStack([]);
  };

  const handleMerge = () => {
    const scoreboards = stack.join("^");
    const isAdminParam = isAdmin ? "true" : "false";
    let url = `${basename}/contest?contests=${scoreboards}`;

    if (isAdmin) {
      url += `&admin=true`;
      url += `&gold=${gold}`;
      url += `&silver=${silver}`;
      url += `&bronze=${bronze}`;
      url += `&criteria=${criteria}`;
    }

    if (diploma) {
      url += `&diploma=${diploma}`;
      url += `&diplomaCriteria=${diplomaCriteria}`;
      url += `&minScore=${minScore}`;
    }

    url += `&title=${scoreboardTitle}`;

    window.open(url, "_blank");
  };

  const handleSplitContest = () => {
    const scoreboards = stack.join("^");
    const isAdminParam = isAdmin ? "true" : "false";
    let url = `${basename}/scoreboards?contests=${scoreboards}`;

    if (isAdmin) {
      url += `&admin=true`;
      url += `&gold=${gold}`;
      url += `&silver=${silver}`;
      url += `&bronze=${bronze}`;
      url += `&criteria=${criteria}`;
    }

    if (diploma) {
      url += `&diploma=${diploma}`;
      url += `&diplomaCriteria=${diplomaCriteria}`;
      url += `&minScore=${minScore}`;
    }

    url += `&title=${scoreboardTitle}`;

    window.open(url, "_blank");
  };

  const handleTitleChange = (event) => {
    setScoreboardTitle(event.target.value);
  };

  return (
    <Grid container spacing={2} justifyContent="center">
      <Grid item xs={12} sm={8} md={6}>
        <div>
          <Typography variant="h6" gutterBottom>
            Unir Scoreboards
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            label="Título del Scoreboard"
            value={scoreboardTitle}
            onChange={handleTitleChange}
            style={{ marginBottom: 10 }}
          />
          <Grid container alignItems="center">
            <Grid item xs={12} md={12} style={{ marginBottom: 10 }}>
              <Typography variant="subtitle2" style={{ marginRight: 10 }}>
                Link de administrador del scoreboard
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="https://omegaup.com/arena/ALIAS_ID/scoreboard/SCOREBOARD_ID"
                value={inputValue}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAdd}
                style={{ marginRight: 10 }}
              >
                Agregar
              </Button>

              <Button
                variant="contained"
                color="error"
                onClick={handleClear}
                style={{ marginRight: 10 }}
              >
                Vaciar
              </Button>

              <Button
                variant="contained"
                color="success"
                onClick={handleMerge}
                style={{ marginRight: 10 }}
              >
                Unir Scoreboards
              </Button>

              <Button
                variant="contained"
                color="secondary"
                onClick={handleSplitContest}
                style={{ marginRight: 10 }}
              >
                Ver Scoreboards
              </Button>

              <FormControlLabel
                control={
                  <Switch
                    checked={isAdmin}
                    onChange={handleAdminToggle}
                    color="warning"
                  />
                }
                label="Admin"
              />
            </Grid>

            {isAdmin && (
              <MedalSelector
                onChangeThresholds={handleThresholdsChange}
                gold={gold}
                silver={silver}
                bronze={bronze}
                criteria={criteria}
                diploma={diploma}
                diplomaCriteria={diplomaCriteria}
                minScore={minScore}
              />
            )}
          </Grid>

          <div style={{ marginTop: 20 }}>
            {stack.map((item, index) => (
              <Paper
                key={index}
                elevation={3}
                style={{
                  padding: 10,
                  marginBottom: 10,
                  backgroundColor: "primary",
                }}
              >
                <Grid
                  container
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Grid item xs={10}>
                    <Typography>{item}</Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton onClick={() => handleEdit(index)}>
                      <EditIcon color="secondary" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(index)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </div>
        </div>
      </Grid>
    </Grid>
  );
};

export default StackComponent;
