import { useEffect, useState } from "react";
import API from "../../api/axios";
import AppLayout from "../../components/layout/AppLayout";

import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";

import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

function CalendarPage() {

  const [events, setEvents] = useState([]);

  useEffect(() => {

    const token = localStorage.getItem("token");

    const fetchJobs = async () => {

      const res = await API.get("/jobs", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const calendarEvents = res.data
  .filter(job => job.interviewDate !== null)
  .map(job => ({
    title: job.company + " - " + job.title,
    start: new Date(job.interviewDate),
    end: new Date(job.interviewDate),
    allDay: true
  }));

      setEvents(calendarEvents);

    };

    fetchJobs();

  }, []);

  return (

    <AppLayout>

      <h2 style={{ marginBottom: 20 }}>
        Interview Calendar
      </h2>

      <div style={{
        background: "#1f2937",
        padding: 20,
        borderRadius: 12
      }}>

        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
        />

      </div>

    </AppLayout>

  );

}

export default CalendarPage;