import { useEffect, useState } from "react";
import API from "../../api/axios";
import AppLayout from "../../components/layout/AppLayout";
import Topbar from "../../components/layout/Topbar";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";

function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState("");
  const [editJob, setEditJob] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [interviewDate, setInterviewDate] = useState("");

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

  // 🔹 Stats
  const applied = jobs.filter(j => j.status === "Applied").length;
  const interview = jobs.filter(j => j.status === "Interview").length;
  const offer = jobs.filter(j => j.status === "Offer").length;
  const rejected = jobs.filter(j => j.status === "Rejected").length;

  // 🔹 Filter logic
  const filteredJobs = jobs
  .filter(j => filter === "All" || j.status === filter)
  .filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>

      {/* 🔹 Topbar */}
      <Topbar 
         onAddClick={() => setShowForm(true)} 
        search={search}
        setSearch={setSearch}
      />

      {/* 🔹 Add Job Form */}
      {showForm && (
        <div style={{
          border: "1px solid #ddd",
          padding: 20,
          marginBottom: 20,
          borderRadius: 10,
          background: "#111",
          color: "white"
        }}>
          <h3>Add Job</h3>

          <input
            placeholder="Role"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <br /><br />

          <input
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          <br /><br />

          <input
            placeholder="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
          <br /><br />

          <textarea
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <br /><br />

          <input
            type="date"
            value={interviewDate}
            onChange={(e) => setInterviewDate(e.target.value)}
          />

<br /><br />


          <button onClick={async () => {
            const token = localStorage.getItem("token");

            await API.post(
             "/jobs",
            {
             title,
             company,
             status,
             notes,
             interviewDate: interviewDate ? new Date(interviewDate) : null
            },
            { headers: { Authorization: `Bearer ${token}` } }
            );

            const res = await API.get("/jobs", {
              headers: { Authorization: `Bearer ${token}` }
            });

            setJobs(res.data);
            setShowForm(false);
            setTitle("");
            setCompany("");
            setStatus("");
            setNotes("");
            setInterviewDate("");
          }}>
            Save Job
          </button>


          <button onClick={() => setShowForm(false)}>
            Cancel
          </button>

          

        </div>
      )}

      {/* 🔹 Filter Tabs */}
      <div style={{ marginBottom: 20 }}>
        {["All", "Applied", "Interview", "Offer", "Rejected"].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              marginRight: 10,
              padding: "6px 14px",
              borderRadius: 6,
              border: "none",
              background: filter === tab
                ? "rgba(62,191,107,1)"
                : "rgba(51,55,66,0.8)",

              color: "white",
              boxShadow: filter === tab
               ? "0 0 12px rgba(62,191,107,0.6)"
               : "none",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 🔹 Stats Cards */}
      <div style={{
        display: "flex",
        gap: 20,
        marginBottom: 30
      }}>
        <StatCard label="Applied" value={applied} />
        <StatCard label="Interview" value={interview} />
        <StatCard label="Offers" value={offer} />
        <StatCard label="Rejected" value={rejected} />
      </div>

      {editJob && (
  <div style={{
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999
  }}>

    <div style={{
  background: "#0f172a",
  padding: 30,
  borderRadius: 14,
  width: 350,
  color: "white",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 30px 80px rgba(0,0,0,0.9)",
  zIndex: 10000
}}>
      <h3>Edit Job</h3>

      <input
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
      />
      <br /><br />

      <input
        value={editCompany}
        onChange={(e) => setEditCompany(e.target.value)}
      />
      <br /><br />

      <input
        value={editStatus}
        onChange={(e) => setEditStatus(e.target.value)}
      />
      <br /><br />

      <textarea
        value={editNotes}
        onChange={(e) => setEditNotes(e.target.value)}
      />
      <br /><br />

      <button onClick={async () => {
        const token = localStorage.getItem("token");

        await API.put(
          `/jobs/${editJob.id}`,
          {
            title: editTitle,
            company: editCompany,
            status: editStatus,
            notes: editNotes
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const res = await API.get("/jobs", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setJobs(res.data);
        setEditJob(null);
      }}>
        Save
      </button>

      <button onClick={() => setEditJob(null)}>
        Cancel
      </button>

      </div>
     </div>
    )}

      {/* 🔹 Job List */}
      <div style={{ marginTop: 30 }}>
        <h3>My Jobs</h3>

        {filteredJobs.length === 0 ? (
          <p>No jobs found</p>
        ) : (
          filteredJobs.map((job) => (
            <div key={job.id} style={{
  background: "rgba(37,40,49,1)",
  padding: 30,
  marginTop: 25,
  borderRadius: 20,
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 25px 60px rgba(0,0,0,0.7)",
  transition: "all 0.3s ease",
  color: "white",
  position: "relative"
}}
onMouseEnter={(e) => {
  e.currentTarget.style.transform = "scale(1.02)";
  e.currentTarget.style.boxShadow = "0 0 40px rgba(111,230,151,0.15)";
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = "scale(1)";
  e.currentTarget.style.boxShadow = "0 25px 60px rgba(0,0,0,0.7)";
}}
>
              <b>{job.title}</b>
              <p>{job.company}</p>
              {job.notes && <p>Notes: {job.notes}</p>}
              {job.interviewDate && (
  <p style={{ fontSize: 13, opacity: 0.8 }}>
    Interview: {new Date(job.interviewDate).toLocaleDateString()}
  </p>
)}

              <StatusBadge status={job.status} />
               <br />
              <button
      onClick={() => {
        setEditJob(job);
        setEditTitle(job.title);
        setEditCompany(job.company);
        setEditStatus(job.status);
        setEditNotes(job.notes || "");
      }}
      style={{
  marginTop: 10,
  padding: "6px 14px",
  borderRadius: 8,
  border: "none",
  background: "#2D89EF",
  color: "white",
  boxShadow: "0 0 12px rgba(45,137,239,0.6)"
}}
    >
      Edit
    </button>

            </div>
          ))
        )}
      </div>

    </AppLayout>
  );
}

export default Dashboard;