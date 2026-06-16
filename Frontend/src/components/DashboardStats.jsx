import { useEffect, useState } from "react";
import API from "../services/api";

function DashboardStats() {
  const [stats, setStats] =
    useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await API.get(
        "/docs/stats"
      );

      setStats(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  if (!stats) return null;

 return (
  <div
    style={{
      display: "flex",
      gap: "20px",
      padding: "20px",
      flexWrap: "wrap",
    }}
  >
    <div
      style={{
        flex: 1,
        minWidth: "200px",
        background: "#f8fafc",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h3>Total Documents</h3>
      <h1>{stats.totalDocuments}</h1>
    </div>

    <div
      style={{
        flex: 1,
        minWidth: "200px",
        background: "#fff7ed",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h3>Pending</h3>
      <h1>{stats.pendingDocuments}</h1>
    </div>

    <div
      style={{
        flex: 1,
        minWidth: "200px",
        background: "#f0fdf4",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h3>Signed</h3>
      <h1>{stats.signedDocuments}</h1>
    </div>
  </div>
)};

export default DashboardStats;