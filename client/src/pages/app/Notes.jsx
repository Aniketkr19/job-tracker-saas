import { useEffect, useState } from "react";
import API from "../../api/axios";
import AppLayout from "../../components/layout/AppLayout";

function Notes() {

  const [jobsWithNotes, setJobsWithNotes] = useState([]);

  useEffect(() => {
    const fetchNotes = async () => {
      const token = localStorage.getItem("token");

      const res = await API.get("/jobs", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const filtered = res.data.filter(job => job.notes);
      setJobsWithNotes(filtered);
    };

    fetchNotes();
  }, []);

  return (
    <AppLayout>

      <h2>Notes</h2>

      {jobsWithNotes.length === 0 ? (
        <p>No notes available</p>
      ) : (
        jobsWithNotes.map(job => (
          <div key={job.id} style={{
            background: "#1f2937",
            padding: 15,
            marginTop: 15,
            borderRadius: 8,
            color: "white"
          }}>
            <h4>{job.title} — {job.company}</h4>
            <p>{job.notes}</p>
          </div>
        ))
      )}

    </AppLayout>
  );
}

export default Notes;