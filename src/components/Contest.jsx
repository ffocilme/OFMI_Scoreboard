import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import NotFound from './NotFound.jsx';
import Scoreboard from './Scoreboard.jsx';
import Scoreboards from './Scoreboards.jsx';
import { useParams } from 'react-router-dom';
import { Contests } from '../data/Contests.jsx';

function Contest(props) {
    const { search } = useLocation();
    const params = new URLSearchParams(search);
    const { id } = useParams();
    const [idContests, setIdContests] = useState(params.get('contests'));
    const [isAdmin,setIsAdmin] = useState(params.get('admin') == "true");
    const [title, setTitle] = useState(params.get('title'));
    const [goldMedals, setGoldMedals] = useState(parseInt(params.get('gold')) || 0);
    const [silverMedals, setSilverMedals] = useState(parseInt(params.get('silver')) || 0);
    const [bronzeMedals, setBronzeMedals] = useState(parseInt(params.get('bronze')) || 0);
    const [criteria, setCriteria] = useState(params.get('criteria'));
    const [diploma, setDiploma] = useState(params.get('diploma') === "true");
    const [diplomaCriteria, setDiplomaCriteria] = useState(params.get('diplomaCriteria'));
    const [minScore, setMinScore] = useState(parseInt(params.get('minScore')) || 0);

    const [contests, setContests] = useState([]);

    useEffect(() => {
        if (idContests) {
            const contestIds = idContests.split('^');
            const contestLinks = contestIds.map(id => `${id}`);
            setContests(contestLinks);
        } else if (id && Contests[id]) {
            if(props.admin == true) setIsAdmin(true); 
            const config = Contests[id].config;
            setTitle(Contests[id].title);
            setGoldMedals(config.gold);
            setSilverMedals(config.silver);
            setBronzeMedals(config.bronze);
            setCriteria(config.criteria);
            setDiploma(config.diploma);
            setDiplomaCriteria(config.diplomaCriteria);
            setMinScore(config.minScore);
            setContests(Contests[id].links);
        }
    }, [idContests, id]);

    let content;

    if (contests.length === 0) {
        content = <NotFound />;
    } else if (contests.length === 1) {
        content = <Scoreboard title={title} link={contests[0]} admin={isAdmin} gold={goldMedals} silver={silverMedals} bronze={bronzeMedals} criteria={criteria} diploma={diploma} diplomaCriteria={diplomaCriteria} minScore={minScore} />;
    } else {
        content = <Scoreboards title={title} links={contests} admin={isAdmin} gold={goldMedals} silver={silverMedals} bronze={bronzeMedals} criteria={criteria} diploma={diploma} diplomaCriteria={diplomaCriteria} minScore={minScore} />;
    }

    return (
        <>
            {content}
        </>
    );
}

export default Contest;
