import { useEffect, useState } from "react";
import API from "../../api/axios";
import AppLayout from "../../components/layout/AppLayout";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer
} from "recharts";

function Analytics() {

  const [jobs, setJobs] = useState([]);

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

  const applied = jobs.filter(j => j.status === "Applied").length;
  const interview = jobs.filter(j => j.status === "Interview").length;
  const offer = jobs.filter(j => j.status === "Offer").length;
  const rejected = jobs.filter(j => j.status === "Rejected").length;

  const data = [
    { name: "Applied", value: applied },
    { name: "Interview", value: interview },
    { name: "Offer", value: offer },
    { name: "Rejected", value: rejected }
  ];

  const COLORS = [
    "#3b82f6",
    "#f59e0b",
    "#22c55e",
    "#ef4444"
  ];

  return (

    <AppLayout>

      <h2 style={{ marginBottom: 30 }}>Applications Analytics</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 30
        }}
      >

        {/* DONUT CHART CARD */}

        <div style={{
          background: "#1f2937",
          padding: 30,
          borderRadius: 14,
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
        }}>

          <h3 style={{ marginBottom: 20 }}>
            Application Distribution
          </h3>

          <ResponsiveContainer width="100%" height={320}>

            <PieChart>

              <Pie
                data={data}
                dataKey="value"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={5}
              >

                {data.map((entry, index) => (

                  <Cell
                    key={index}
                    fill={COLORS[index]}
                  />

                ))}

              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>

          </ResponsiveContainer>

        </div>


        {/* BAR CHART CARD */}

        <div style={{
          background: "#1f2937",
          padding: 30,
          borderRadius: 14,
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
        }}>

          <h3 style={{ marginBottom: 20 }}>
            Application Status Overview
          </h3>

          <ResponsiveContainer width="100%" height={320}>

            <BarChart data={data}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="value"
                radius={[8,8,0,0]}
                fill="#22c55e"
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </div>


      {/* STATS SUMMARY */}

      <div
        style={{
          display: "flex",
          gap: 20,
          marginTop: 40
        }}
      >

        <div style={cardStyle("#3b82f6")}>
          <h3>{applied}</h3>
          <p>Applied</p>
        </div>

        <div style={cardStyle("#f59e0b")}>
          <h3>{interview}</h3>
          <p>Interview</p>
        </div>

        <div style={cardStyle("#22c55e")}>
          <h3>{offer}</h3>
          <p>Offers</p>
        </div>

        <div style={cardStyle("#ef4444")}>
          <h3>{rejected}</h3>
          <p>Rejected</p>
        </div>

      </div>

    </AppLayout>

  );

}

const cardStyle = (color) => ({

  flex: 1,
  padding: 25,
  borderRadius: 12,
  background: "#1f2937",
  textAlign: "center",
  borderTop: `4px solid ${color}`,
  boxShadow: "0 10px 30px rgba(0,0,0,0.5)"

});

export default Analytics;