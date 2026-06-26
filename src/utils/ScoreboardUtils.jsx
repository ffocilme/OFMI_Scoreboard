import React, { useState, useEffect } from "react";
import LoadingSpinner from "../components/LoadingSpinner.jsx";
import NotFound from "../components/NotFound.jsx";
import states from "../data/states.js";

//Formating
export const getClassName = (points) => {
  if (points >= 100) {
    return "success";
  } else if (points === 0) {
    return "fail";
  } else if (points < 100 && points > 0) {
    return "partial";
  } else {
    return "";
  }
};
export function getState(username) {
  const match = username.match(/:(\w+)-/);
  if (match && match[1]) {
    const state = match[1].toUpperCase();
    if (state in states) {
      return states[state];
    } else {
      return "";
    }
  } else {
    return "";
  }
}
export function wonMedal(
  entry,
  index,
  runs,
  medalCriterion,
  goldThreshold,
  silverThreshold,
  bronzeThreshold,
  diploma,
  criteria,
  minScore
) {
  if (medalCriterion === "medals") {
    if (index <= goldThreshold) {
      return "gold";
    } else if (index <= silverThreshold + goldThreshold) {
      return "silver";
    } else if (index <= bronzeThreshold + silverThreshold + goldThreshold) {
      return "bronze";
    } else if (
      getDiploma(diploma, criteria, minScore, entry.total.points, runs)
    ) {
      return "diploma";
    }
  } else if (medalCriterion === "place") {
    if (entry.place <= goldThreshold) {
      return "gold";
    } else if (entry.place <= silverThreshold) {
      return "silver";
    } else if (entry.place <= bronzeThreshold) {
      return "bronze";
    } else if (
      getDiploma(diploma, criteria, minScore, entry.total.points, runs)
    ) {
      return "diploma";
    }
  } else if (medalCriterion === "points") {
    if (entry.total.points >= goldThreshold) {
      return "gold";
    } else if (entry.total.points >= silverThreshold) {
      return "silver";
    } else if (entry.total.points >= bronzeThreshold) {
      return "bronze";
    } else if (
      getDiploma(diploma, criteria, minScore, entry.total.points, runs)
    ) {
      return "diploma";
    }
  }

  return "none";
}
export function getEmoji(medal) {
  if (medal === "gold") return `🥇`;
  else if (medal === "silver") return `🥈`;
  else if (medal === "bronze") return `🥉`;
  else if (medal === "diploma") return `🎖️`;
  return "";
}

function getDiploma(diploma, criteria, minScore, points, runs) {
  if (!diploma) return false;

  if (criteria == "points") {
    if (points >= minScore) return true;
  } else if (runs > 0) {
    return true;
  }
  return false;
}

export const mergeProblems = (existingProblems, newProblems) => {
  const mergedProblems = {};

  for (const problem of existingProblems) {
    mergedProblems[problem.alias] = { ...problem, totalPoints: 0 };
  }

  for (const problem of newProblems) {
    const alias = problem.alias;
    if (!mergedProblems[alias]) {
      mergedProblems[alias] = { ...problem, totalPoints: 0 };
    }

    mergedProblems[alias].totalPoints += problem.points;
  }

  return Object.values(mergedProblems);
};

const calculateTotalRuns = (entry) => {
  return entry.problems.reduce((acc, problem) => acc + problem.runs, 0);
};

const sortScoreboard = (scoreboard) => {
  let mergedArray = scoreboard.slice();
  mergedArray.sort((a, b) => {
    if (a.total.points === b.total.points) {
      if (a.total.points === 0) {
        return a.total.runs - b.total.runs;
      }

      if (a.total.penalty === b.total.penalty) {
        return b.total.runs - a.total.runs;
      }

      return a.total.penalty - b.total.penalty;
    }
    return b.total.points - a.total.points;
  });

  let prev = null;
  let place = 1;

  for (let i = 0; i < mergedArray.length; i++) {
    const entry = mergedArray[i];
    if (prev === null) {
      entry.place = place;
    } else {
      const a = prev.total;
      const b = entry.total;

      if (a.points === b.points) {
        if (a.points === 0) {
          if (b.runs === 0 && a.runs > 0) {
            place++;
          }
        } else if (a.penalty === b.penalty) {
          if (a.runs === b.runs) {
            entry.place = place;
          } else {
            place++;
          }
        } else {
          place++;
        }
      } else {
        place++;
      }

      entry.place = place;
    }
    prev = entry;
  }

  return mergedArray;
};

export const formatScoreboard = (scoreboard) => {
  let isInvited = scoreboard.filter((entry) => entry.is_invited);
  for (let i = 0; i < isInvited.length; i++) {
    isInvited[i].total.runs = calculateTotalRuns(isInvited[i]);
  }

  const finalScoreboard = sortScoreboard(scoreboard);
  return finalScoreboard;
};

export const mergeScoreboards = (scoreboards) => {
  const merged = {};
  for (const scoreboard of scoreboards) {
    const invitedEntries = scoreboard.filter((entry) => entry.is_invited);
    for (const entry of invitedEntries) {
      const username = entry.username;
      if (!merged[username]) {
        merged[username] = { ...entry };
      } else {
        const existingEntry = merged[username];
        existingEntry.problems = mergeProblems(
          existingEntry.problems,
          entry.problems
        );
        existingEntry.total.points += entry.total.points;
        existingEntry.total.penalty += entry.total.penalty;
        existingEntry.total.runs = calculateTotalRuns(existingEntry);
      }
    }
  }

  let mergedArray = Object.values(merged);
  const finalScoreboard = formatScoreboard(mergedArray);
  //   console.log(finalScoreboard);
  return finalScoreboard;
};

export const getColumns = (problems) => {
  return [
    "Lugar",
    "Nombre",
    "Estado",
    ...problems.map((problem, index) => String.fromCharCode(65 + index)),
    "Total",
  ];
};

export const getRows = (
  scoreboards,
  medalCriterion,
  goldThreshold,
  silverThreshold,
  bronzeThreshold,
  diploma,
  criteria,
  minScore
) => {
  return scoreboards.map((entry, index) => {
    const medal = wonMedal(
      entry,
      index + 1,
      entry.total.runs,
      medalCriterion,
      goldThreshold,
      silverThreshold,
      bronzeThreshold,
      diploma,
      criteria,
      minScore
    );
    return {
      key: entry.username,
      medal: medal,
      cells: [
        {
          key: "place",
          value: entry.place,
          className: medal,
          title: index + 1,
        },
        {
          key: "name",
          value: `${entry.name} ${getEmoji(medal)}`,
          className: medal,
          title: entry.username,
        },
        {
          key: "state",
          value: getState(entry.username),
          className: medal,
          title: entry.country,
        },
        ...entry.problems.map((problem, index) => ({
          key: index,
          value: problem.points,
          className: getClassName(problem.points),
          title: problem.alias,
        })),
        {
          key: "total",
          value: `${entry.total.points} (${entry.total.penalty})`,
          className: getClassName(entry.total.points),
          title: `Envios: ${entry.total.runs}`,
        },
      ],
    };
  });
};
