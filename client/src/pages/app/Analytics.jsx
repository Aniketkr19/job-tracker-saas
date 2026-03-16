import { useEffect, useState } from "react";
import API from "../../api/axios";
import AppLayout from "../../components/layout/AppLayout";
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer
} from "recharts";

function Analytics() {
  const [jobs, setJobs] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchJobs = async () => {
      const res = await API.get("/jobs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(res.data);
    };
    fetchJobs();
  }, []);

  const applied   = jobs.filter(j => j.status === "Applied").length;
  const interview = jobs.filter(j => j.status === "Interview").length;
  const offer     = jobs.filter(j => j.status === "Offer").length;
  const rejected  = jobs.filter(j => j.status === "Rejected").length;

  const data = [
    { name: "Applied",   value: applied   },
    { name: "Interview", value: interview },
    { name: "Offer",     value: offer     },
    { name: "Rejected",  value: rejected  },
  ];

  const COLORS = ["#3b82f6", "#f59e0b", "#22c55e", "#ef4444"];

  return (
    <AppLayout>
      <div style={{ padding: isMobile ? "0 12px 40px" : "0 24px 40px" }}>

        <h2 style={{
          marginBottom: 24, fontSize: isMobile ? 18 : 22,
          fontWeight: 800, color: "#f1f5f9",
        }}>
          Applications Analytics
        </h2>

        {/* Charts — stack on mobile, side by side on desktop */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? 16 : 24,
          marginBottom: 24,
        }}>

          {/* DONUT CHART */}
          <div style={{
            background: "#1f2937", padding: isMobile ? 16 : 24,
            borderRadius: 14, boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            overflow: "hidden",
          }}>
            <h3 style={{ marginBottom: 16, fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>
              Application Distribution
            </h3>
            <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius={isMobile ? 55 : 75}
                  outerRadius={isMobile ? 85 : 115}
                  paddingAngle={4}
                >
                  {data.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#0d1525", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  labelStyle={{ color: "#f1f5f9" }}
                />
                <Legend
                  iconSize={10}
                  formatter={(value) => (
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* BAR CHART */}
          <div style={{
            background: "#1f2937", padding: isMobile ? 16 : 24,
            borderRadius: 14, boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            overflow: "hidden",
          }}>
            <h3 style={{ marginBottom: 16, fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>
              Application Status Overview
            </h3>
            <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
              <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#64748b", fontSize: isMobile ? 9 : 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                />
                <Tooltip
                  contentStyle={{ background: "#0d1525", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  labelStyle={{ color: "#f1f5f9" }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>{value}</span>
                  )}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats summary — 2 cols on mobile, 4 on desktop */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap: isMobile ? 10 : 16,
        }}>
          {[
            { label: "Applied",   value: applied,   color: "#3b82f6" },
            { label: "Interview", value: interview, color: "#f59e0b" },
            { label: "Offers",    value: offer,     color: "#22c55e" },
            { label: "Rejected",  value: rejected,  color: "#ef4444" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              padding: isMobile ? "16px" : "20px",
              borderRadius: 12,
              background: "#1f2937",
              textAlign: "center",
              borderTop: `3px solid ${color}`,
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}>
              <h3 style={{ fontSize: isMobile ? 28 : 32, fontWeight: 800, color, margin: "0 0 4px" }}>
                {value}
              </h3>
              <p style={{ fontSize: 12, color: "#64748b", margin: 0, fontWeight: 600 }}>
                {label}
              </p>
            </div>
          ))}
        </div>

      </div>
    </AppLayout>
  );
}

export default Analytics;