import { useEffect, useState } from "react";
import API from "../services/api";

function AuditHistory({ documentId }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await API.get(
        `/audit/${documentId}`
      );

      setLogs(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      style={{
        marginTop: "30px",
        border: "1px solid #ddd",
        padding: "20px",
      }}
    >
      <h2>Activity History</h2>

      {logs.length === 0 ? (
        <p>No activity found</p>
      ) : (
        logs.map((log) => (
          <div
            key={log._id}
            style={{
              marginBottom: "10px",
            }}
          >
            <strong>{log.action}</strong>

            <p>{log.details}</p>

            <small>
              {new Date(
                log.createdAt
              ).toLocaleString()}
            </small>
          </div>
        ))
      )}
    </div>
  );
}

export default AuditHistory;