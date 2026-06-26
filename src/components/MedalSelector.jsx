import React, { useState } from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

const MedalSelector = ({ onChangeThresholds, gold = 0, silver = 0, bronze = 0, criteria = 'medals', diploma = false, diplomaCriteria = 'points' , minScore = 0}) => {
    const [criteriaValue, setCriteria] = useState(criteria);
    const [goldThreshold, setGoldThreshold] = useState(gold);
    const [silverThreshold, setSilverThreshold] = useState(silver);
    const [bronzeThreshold, setBronzeThreshold] = useState(bronze);
    const [giveDiploma, setGiveDiploma] = useState(diploma);
    const [_diplomaCriteria, setDiplomaCriteria] = useState(diplomaCriteria);
    const [_minScore, setMinScore] = useState(minScore);

    const handleChange = (event) => {
        const { value } = event.target;
        setCriteria(value);
        onChangeThresholds(value, gold, silver, bronze, diploma, diplomaCriteria, minScore);
    };
    
    const handleGoldThresholdChange = (event) => {
        const value = parseInt(event.target.value);
        const goldValue = isNaN(value) ? 0 : value; 
        setGoldThreshold(goldValue);
        onChangeThresholds(criteriaValue, goldValue, silverThreshold, bronzeThreshold, diploma, diplomaCriteria, minScore);
    };
    
    const handleSilverThresholdChange = (event) => {
        const value = parseInt(event.target.value);
        const silverValue = isNaN(value) ? 0 : value; 
        setSilverThreshold(silverValue);
        onChangeThresholds(criteriaValue, goldThreshold, silverValue, bronzeThreshold, diploma, diplomaCriteria, minScore);
    };
    
    const handleBronzeThresholdChange = (event) => {
        const value = parseInt(event.target.value);
        const bronzeValue = isNaN(value) ? 0 : value; 
        setBronzeThreshold(bronzeValue);
        onChangeThresholds(criteriaValue, goldThreshold, silverThreshold, bronzeValue, diploma, diplomaCriteria, minScore);
    };

    const handleDiplomaChange = (event) => {
        setGiveDiploma(event.target.checked);
        onChangeThresholds(criteriaValue, goldThreshold, silverThreshold, bronzeThreshold, event.target.checked, diplomaCriteria, minScore);
    };
    
    const handleDiplomaCriteriaChange = (event) => {
        const { value } = event.target; 
        setDiplomaCriteria(value)
        console.log( _diplomaCriteria);
        onChangeThresholds(criteriaValue, goldThreshold, silverThreshold, bronzeThreshold, diploma, value, minScore); 
    
    };
    
   const handleMinScoreChange = (event) => {
    const value = parseInt(event.target.value);
    const minScoreValue = isNaN(value) ? 0 : value; 
    setMinScore(minScoreValue);
    onChangeThresholds(criteriaValue, goldThreshold, silverThreshold, bronzeThreshold, diploma, diplomaCriteria, minScoreValue);
};
    

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, marginTop: 2 }}>
                <FormControl>
                    <InputLabel id="criteria">Criterio de Selección</InputLabel>
                    <Select
                        labelId="criteriaLabel"
                        id="criteriaId"
                        value={criteriaValue}
                        label="Criterio de Selección"
                        onChange={handleChange}
                    >
                        <MenuItem value={'medals'}>Cantidad de Medallas</MenuItem>
                        <MenuItem value={'place'}>Lugar Mínimo</MenuItem>
                        <MenuItem value={'points'}>Puntaje Mínimo</MenuItem>
                    </Select>
                </FormControl>
                <TextField id="outlined-basic" label={`🥇 Oro (${goldThreshold})`} variant="outlined" onChange={handleGoldThresholdChange} sx={{ marginRight: 2 }} />
                <TextField id="filled-basic" label={`🥈 Plata (${silverThreshold})`} variant="outlined" onChange={handleSilverThresholdChange} sx={{ marginRight: 2 }} />
                <TextField id="standard-basic" label={`🥉 Bronce (${bronzeThreshold})`} variant="outlined" onChange={handleBronzeThresholdChange} sx={{ marginRight: 2 }} />
                <FormControlLabel
                    control={<Switch checked={giveDiploma} onChange={handleDiplomaChange} />}
                    label="Dar Diploma"
                    sx={{ marginRight: 2 }}
                />
            </Box>
            {giveDiploma && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 2 }}>
                    <FormControl sx={{ marginRight: 2 }}>
                        <InputLabel id="diplomaCriteriaLabel">Criterio de Diploma</InputLabel>
                        <Select
                            labelId="diplomaCriteriaLabel"
                            id="diplomaCriteriaId"
                            value={_diplomaCriteria}
                            label="Criterio de Diploma"
                            onChange={handleDiplomaCriteriaChange}
                        >
                            <MenuItem value={'points'}>Puntaje Mínimo</MenuItem>
                            <MenuItem value={'tried'}>Realizó al menos un envío</MenuItem>
                        </Select>
                    </FormControl>
                    {_diplomaCriteria === 'points' && (
                        <TextField
                            id="minScore"
                            label="Puntaje Mínimo"
                            variant="outlined"
                            value={_minScore}
                            onChange={handleMinScoreChange}
                        />
                    )}
                </Box>
            )}
        </Box>
    );
};

export default MedalSelector;
