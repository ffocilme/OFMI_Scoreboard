import * as React from 'react';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import FeaturedCard from "./FeaturedCard.jsx";
import { Contests } from "../data/Contests.jsx";

const StyledGrid = styled(Grid)(({ theme }) => ({
  margin: '0 auto',
  maxWidth: '100%', 
  overflowX: 'hidden',
  marginBottom: theme.spacing(4)
}));

export default function FeaturedContests(props) {
  return (
    <>
      <h1>Concursos Destacados</h1>
      <Box sx={{ width: '100%', margin: '0 auto', overflowX: 'hidden' }}>
        <StyledGrid container spacing={3}>
          {
            Object.keys(Contests).map((id) => (
              <Grid key={id} item xs={12} sm={6} md={3}>
                <FeaturedCard
                  id={id}
                  title={Contests[id].title}
                  organizer={Contests[id].organizer}
                  img={Contests[id].img}
                  content={Contests[id].content}
                  alt={Contests[id].alternative}
                />
              </Grid>
            ))
          }
        </StyledGrid>
      </Box>
    </>
  );
}
