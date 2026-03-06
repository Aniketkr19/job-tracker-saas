import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/public/Login";
import Dashboard from "./pages/app/Dashboard";
import Landing from "./pages/public/Landing";
import Profile from "./pages/app/Profile";
import Notes from "./pages/app/Notes";
import Applications from "./pages/app/Applications";
import Analytics from "./pages/app/Analytics";
import Calendar from "./pages/app/Calendar";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/calendar" element={<Calendar />} />
        
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;