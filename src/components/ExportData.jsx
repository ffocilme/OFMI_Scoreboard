import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";

function ExportData({ columns, rows, title = "Scoreboard" }) {
  const [headers, setHeaders] = useState();
  const [data, setData] = useState();
  const [hasFormat, setHasFormat] = useState(false);

  useEffect(() => {
    formatData(rows);
  }, [rows]);

  function getNumber(str) {
    const regex = /\d+/g;
    return str.match(regex).map(Number);
  }

  function getMedal(medal) {
    if (medal === "gold") {
      return "Oro";
    } else if (medal === "silver") {
      return "Plata";
    } else if (medal === "bronze") {
      return "Bronce";
    } else if (medal === "diploma") {
      return "Mención Honorifica";
    }
    return "N/A";
  }

  function formatData(rows) {
    let columnsNames = new Set();
    const rowsData = [];

    columnsNames.add("Lugar");
    columnsNames.add("Nombre Completo");
    columnsNames.add("Id");
    columnsNames.add("Estado");
    columnsNames.add("Medallista");

    rows.forEach((row) => {
      const cells = row["cells"];
      const medal = row["medal"];
      const wonMedal = medal !== "none";
      const currentData = [];

      cells.forEach((cell) => {
        if (cell.key === "total") {
          let totalAux = cell.value;
          totalAux = getNumber(totalAux);
          const runs = getNumber(cell.title)[0];
          const total = totalAux[0];
          const penalty = totalAux[1];
          currentData.push(total, penalty, runs);
        } else if (cell.key === "name") {
          let name = cell.value;

          if (wonMedal) {
            name = name.slice(0, -3);
          }
          const id = cell.title;

          currentData.push(name, id);
        } else if (cell.key === "state") {
          const state = cell.value;
          currentData.push(state);
          currentData.push(getMedal(medal));
        } else {
          const alias = cell.title;
          const points = cell.value;

          if (typeof alias === "string") {
            columnsNames.add(alias);
          }
          currentData.push(points);
        }
      });

      rowsData.push(currentData);
    });

    columnsNames.add("Total");
    columnsNames.add("Penalizacion");
    columnsNames.add("Intentos");

    const headersName = [...columnsNames];
    setHeaders(headersName);
    setData(rowsData);
    setHasFormat(true);
  }

  function downloadCsv() {
    if (!hasFormat) {
      formatData(rows);
    }

    const dataWithHeaders = data;
    dataWithHeaders.unshift(headers);
    const csvData = dataWithHeaders
      .map((row) => Object.values(row).join(","))
      .join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function downloadJson() {
    if (!hasFormat) {
      formatData(rows);
    }

    const dataJSON = data.map((entry) => {
      const json = {};
      entry.forEach((value, index) => {
        json[headers[index]] = value;
      });

      return json;
    });

    const blob = new Blob([JSON.stringify(dataJSON)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function downloadPdf() {
    if (!hasFormat) {
      formatData(rows);
    }

    const doc = new jsPDF({
      orientation: "landscape",
    });

    doc.autoTable({
      head: [headers],
      body: data,
      startY: 20,
      styles: { cellPadding: 2, fontSize: 10 },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: "auto" },
      },
    });

    doc.save("data.pdf");
  }

  return (
    <div>
      <Button
        variant="contained"
        style={{ margin: "2em", backgroundColor: "#2196f3", color: "white" }}
        onClick={downloadCsv}
        startIcon={<CloudDownloadIcon />}
      >
        Descargar CSV
      </Button>
      <Button
        variant="contained"
        style={{ margin: "2em", backgroundColor: "#4caf50", color: "white" }}
        onClick={downloadJson}
        startIcon={<CloudDownloadIcon />}
      >
        Descargar JSON
      </Button>
    </div>
  );
}

export default ExportData;
