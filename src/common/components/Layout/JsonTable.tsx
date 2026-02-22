import React, { useState, useEffect } from "react";

const JsonTable = ({ src }) => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    fetch(src)
      .then((response) => response.json())
      .then((data) => {
        setTableData(data);
      });
  }, [src]);

  const tableHeaders = tableData.length > 0 ? Object.keys(tableData[0]) : [];

  return (
    <div className="json-table">
      <table>
        <thead>
          <tr>
            {tableHeaders.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((rowData) => (
            <tr key={rowData.id}>
              {tableHeaders.map((header) => (
                <td key={`${rowData.id}-${header}`}>{rowData[header]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JsonTable;
