import { useEffect, useState } from "react";
import API from "../../api/axios";
import AppLayout from "../../components/layout/AppLayout";

import {
  DndContext,
  pointerWithin,
  DragOverlay,
  useDroppable
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

function JobCard({ job }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: 16,
    borderRadius: 12,
    background: "#1f2937",
    color: "white",
    marginBottom: 12,
    cursor: "grab",
    boxShadow: "0 6px 20px rgba(0,0,0,0.5)"
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <b>{job.title}</b>
      <p style={{ margin: "5px 0" }}>{job.company}</p>

      {job.notes && (
        <p style={{ fontSize: 12, opacity: 0.7 }}>
          {job.notes.slice(0, 40)}
        </p>
      )}
    </div>
  );
}

function Column({ status, jobs }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        background: isOver
          ? "rgba(34,197,94,0.15)"
          : "rgba(37,40,49,1)",
        padding: 16,
        borderRadius: 14,
        height: "70vh",
        overflowY: "auto",
        border: "1px solid rgba(255,255,255,0.05)"
      }}
    >
      <h3 style={{ marginBottom: 15 }}>
        {status} ({jobs.length})
      </h3>

      <SortableContext
        items={jobs.map((j) => j.id)}
        strategy={verticalListSortingStrategy}
      >
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </SortableContext>
    </div>
  );
}

function Applications() {
  const [jobs, setJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [search, setSearch] = useState("");

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

  const handleDragStart = (event) => {
    const job = jobs.find((j) => j.id === event.active.id);
    setActiveJob(job);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) return;

    const jobId = active.id;
    const newStatus = over.id;

    const token = localStorage.getItem("token");

    await API.put(
      `/jobs/${jobId}`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const updated = jobs.map((job) =>
      job.id === jobId ? { ...job, status: newStatus } : job
    );

    setJobs(updated);
    setActiveJob(null);
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <h2 style={{ marginBottom: 20 }}>Applications Pipeline</h2>

      <input
        placeholder="Search jobs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          marginBottom: 20,
          padding: 10,
          borderRadius: 8,
          border: "none",
          width: 300
        }}
      />

      <DndContext
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 20
          }}
        >
          {STATUSES.map((status) => {
            const columnJobs = filteredJobs.filter(
              (job) => job.status === status
            );

            return (
              <Column
                key={status}
                status={status}
                jobs={columnJobs}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeJob ? (
            <div
              style={{
                padding: 16,
                background: "#111827",
                borderRadius: 12,
                color: "white",
                boxShadow: "0 20px 60px rgba(0,0,0,0.8)"
              }}
            >
              <b>{activeJob.title}</b>
              <p>{activeJob.company}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </AppLayout>
  );
}

export default Applications;