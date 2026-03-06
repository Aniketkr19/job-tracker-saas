import Sidebar from "../sidebar/Sidebar";

function AppLayout({ children }) {
  return (
    <div style={{
      minHeight: "100vh",
     background: "rgba(26,29,37,1)"
    }}>

      {/* Sidebar stays fixed */}
      <Sidebar />

      {/* Main Content */}
      <div style={{
        marginLeft: 325,   // push content right
        padding: 40,
        minHeight: "100vh"
      }}>
        {children}
      </div>

    </div>
  );
}

export default AppLayout;