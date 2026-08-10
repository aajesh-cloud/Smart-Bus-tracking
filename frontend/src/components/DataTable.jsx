// frontend/src/components/DataTable.jsx

// columns: [{ key: "busNumber", label: "Bus Number" }, ...]
// data: array of row objects
// renderCell: optional function (row, column) => custom JSX for a cell
// actions: optional function (row) => JSX (buttons for that row)
const DataTable = ({ columns, data, renderCell, actions }) => {
  return (
    <div
      style={{
        backgroundColor: "#1e293b",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#0f172a" }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  fontSize: "13px",
                  color: "#94a3b8",
                  fontWeight: 600,
                }}
              >
                {col.label}
              </th>
            ))}
            {actions && (
              <th style={{ padding: "12px 16px", fontSize: "13px", color: "#94a3b8" }}>
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                style={{ padding: "24px", textAlign: "center", color: "#94a3b8" }}
              >
                No records found.
              </td>
            </tr>
          )}
          {data.map((row) => (
            <tr key={row._id} style={{ borderTop: "1px solid #334155" }}>
              {columns.map((col) => (
                <td key={col.key} style={{ padding: "12px 16px", fontSize: "14px" }}>
                  {renderCell ? renderCell(row, col) : row[col.key]}
                </td>
              ))}
              {actions && (
                <td style={{ padding: "12px 16px" }}>{actions(row)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;