import { useEffect, useState } from "react";
import API from "../services/api";

function RecentActivity() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const docsRes = await API.get("/docs");

      if (docsRes.data.length === 0) {
        return;
      }

      const latestDoc = docsRes.data[0];

      const auditRes = await API.get(
        `/audit/${latestDoc._id}`
      );

      setLogs(auditRes.data.slice(0, 5));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "12px",
        padding: "20px",
        margin: "20px",
        boxShadow:
          "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2
        style={{
          marginBottom: "15px",
        }}
      >
        Recent Activity
      </h2>

      {logs.length === 0 ? (
        <p>No recent activity</p>
      ) : (
        logs.map((log) => (
          <div
            key={log._id}
            style={{
              padding: "10px 0",
              borderBottom:
                "1px solid #eee",
            }}
          >
            <strong>
              {log.action}
            </strong>

            <p
              style={{
                margin: "5px 0",
              }}
            >
              {log.details}
            </p>

            <small
              style={{
                color: "#666",
              }}
            >
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

export default RecentActivity;