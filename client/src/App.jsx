import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/public/Login";
import Dashboard from "./pages/app/Dashboard";
import Landing from "./pages/public/Landing";
import Profile from "./pages/app/Profile";
import Notes from "./pages/app/Notes";
import Applications from "./pages/app/Applications";
import Analytics from "./pages/app/Analytics";
import Calendar from "./pages/app/Calendar";
import Register from "./pages/public/Register";
import Documents from  "./pages/app/Documents";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Settings from "./pages/app/Settings";





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
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
        <Route path="/documents" element={<Documents />} />
        <Route path="/settings" element={<Settings />} />

        
        
      </Routes>
    </BrowserRouter>
  );
}
<h1 className="text-5xl text-emerald-400 font-bold">
Tailwind Working
</h1>

export default App;