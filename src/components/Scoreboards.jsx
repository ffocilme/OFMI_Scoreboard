import React, { useState, useEffect } from "react";
import MedalSelector from "./MedalSelector.jsx";
import ScoreboardTable from "./ScoreboardTable.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";
import NotFound from "./NotFound.jsx";
import * as sb from "../utils/ScoreboardUtils.jsx";
import * as api from "../utils/ApiFetch.jsx";
import { useQuery } from "react-query";
import ExportData from "./ExportData.jsx";

const Scoreboards = ({
  links,
  admin,
  gold = 0,
  silver = 0,
  bronze = 0,
  criteria = "medals",
  title = "Scoreboard",
  diploma = false,
  diplomaCriteria = "points",
  minScore = 0,
}) => {
  const [problems, setProblems] = useState([]);
  const [scoreboards, setScoreboards] = useState([]);
  const [goldThreshold, setGoldThreshold] = useState(gold);
  const [silverThreshold, setSilverThreshold] = useState(silver);
  const [bronzeThreshold, setBronzeThreshold] = useState(bronze);
  const [medalCriterion, setMedalCriterion] = useState(criteria);
  const [running, setRunning] = useState(false);
  const [_minScore, setMinScore] = useState(minScore);
  const [_diploma, setDiploma] = useState(diploma);
  const [_diplomaCriteria, setDiplomaCriteria] = useState(diplomaCriteria);
  const [currentTime, setCurrentTime] = useState(new Date());

  const handleThresholdsChange = (
    criteria,
    gold,
    silver,
    bronze,
    diploma,
    diplomaCriteria,
    minScore
  ) => {
    setMedalCriterion(criteria);
    setGoldThreshold(gold);
    setSilverThreshold(silver);
    setBronzeThreshold(bronze);
    setDiploma(diploma);
    setDiplomaCriteria(diplomaCriteria);
    setMinScore(minScore);
  };

  const {
    data: scoreboardsData,
    isLoading,
    isError,
  } = useQuery("scoreboardsData", async () => {
    const promises = links.map((link) => api.fetchAPI(link));
    const responses = await Promise.all(promises);
    return responses;
  });

  useEffect(() => {
    if (scoreboardsData) {
      const allScoreboards = [];
      let startTime = Number.MAX_SAFE_INTEGER;
      let finishTime = 0;

      scoreboardsData.forEach((payloadJSON) => {
        allScoreboards.push(payloadJSON["scoreboard"]["ranking"]);
        const currentStartTime = payloadJSON["scoreboard"]["start_time"] * 1000;
        const currentFinishTime =
          payloadJSON["scoreboard"]["finish_time"] * 1000;

        if (currentStartTime < startTime) startTime = currentStartTime;
        if (currentFinishTime > finishTime) finishTime = currentFinishTime;
      });

      const merged = sb.mergeScoreboards(allScoreboards);
      setScoreboards(merged);

      const problemSet = merged[0]["problems"];
      setProblems(problemSet);

      startTime = new Date(startTime);
      finishTime = new Date(finishTime);
      setCurrentTime(new Date());

      if (currentTime < startTime) setRunning(startTime.toLocaleDateString());
      else if (startTime <= currentTime && currentTime <= finishTime)
        setRunning(true);
      else setRunning(false);

      handleThresholdsChange(
        criteria,
        gold,
        silver,
        bronze,
        _diploma,
        _diplomaCriteria,
        _minScore
      );
    }
  }, [
    scoreboardsData,
    gold,
    silver,
    bronze,
    criteria,
    diploma,
    diplomaCriteria,
    minScore,
  ]);

  if (isError) {
    return <NotFound error={"No se encontro el scoreboard"} />;
  }

  if (isLoading || scoreboardsData === undefined) {
    return <LoadingSpinner />;
  }

  const columns = sb.getColumns(problems);
  const rows = sb.getRows(
    scoreboards,
    medalCriterion,
    goldThreshold,
    silverThreshold,
    bronzeThreshold,
    _diploma,
    _diplomaCriteria,
    _minScore
  );

  return (
    <>
      <h1>
        {title}{" "}
        {running === true
          ? "(En Curso)"
          : running === false
          ? "(Terminado)"
          : `(Inicia el ${running})`}
      </h1>
      {admin && (
        <MedalSelector
          onChangeThresholds={handleThresholdsChange}
          gold={gold}
          silver={silver}
          bronze={bronze}
          criteria={medalCriterion}
          diploma={_diploma}
          diplomaCriteria={_diplomaCriteria}
          minScore={_minScore}
        />
      )}
      <ScoreboardTable headers={columns} data={rows} />
      {admin && (
        <ExportData
          columns={columns}
          rows={rows}
          title={`Scoreboard ${title} ${currentTime}`}
        />
      )}
    </>
  );
};

export default Scoreboards;
