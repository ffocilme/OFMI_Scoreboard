import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import NotFound from './NotFound.jsx';
import Scoreboard from './Scoreboard.jsx';
import Scoreboards from './Scoreboards.jsx';

function Contest() {
    const { search } = useLocation();
    const params = new URLSearchParams(search);
    const idContests = params.get('contests');
    const isAdmin = params.get('admin') == "true"; 
    const title = params.get('title');
    const goldMedals = parseInt(params.get('gold')) || 0; 
    const silverMedals = parseInt(params.get('silver')) || 0; 
    const bronzeMedals = parseInt(params.get('bronze')) || 0; 
    const criteria = params.get('criteria') || 'medals'; 
    const diploma = params.get('diploma') == "true";
    const diplomaCriteria = params.get('diplomaCriteria');
    const minScore = parseInt(params.get('minScore'));

    const [contests, setContests] = useState([]);

    useEffect(() => {
        if (idContests) {
            const contestIds = idContests.split('^');
            const contestLinks = contestIds.map(id => `${id}`);
            setContests(contestLinks);
        }
    }, [idContests]);



    let content;
    if (contests.length === 0) {
        content = <NotFound />;
    } else if (contests.length === 1) {
        content = <Scoreboard title={title} link={contests[0]} admin={isAdmin} gold={goldMedals} silver={silverMedals} bronze={bronzeMedals} criteria={criteria} diploma={diploma} diplomaCriteria={diplomaCriteria} minScore={minScore} />;
    } else {
        return (<div>
        <h1>{title}</h1>
        {contests.map((contest, index) => (
          <Scoreboard key = {index} title={title} link={contest} admin={isAdmin} gold={goldMedals} silver={silverMedals} bronze={bronzeMedals} criteria={criteria} diploma={diploma} diplomaCriteria={diplomaCriteria} minScore={minScore} />
        ))}
      </div>);
    }

    return (
        <>
            {content}
        </>
    );
}

export default Contest;
