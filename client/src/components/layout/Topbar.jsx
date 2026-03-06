function Topbar({onAddClick, search, setSearch}) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 30,
      alignItems: "center"
    }}>
      <input
        placeholder="Search jobs..."
        value = {search}
        onChange ={(e) => setSearch(e.target.value)}
        style={{
          padding: 10,
          width: 250,
          borderRadius: 6,
         background: "rgba(51,55,66,0.5)",
         border: "1px solid rgba(255,255,255,0.08)",
        color: "white"
        }}
      />

      <button 
      onClick = {onAddClick} 
        style={{
  background: "linear-gradient(180deg, rgba(111,230,151,1), rgba(62,191,107,1))",
  padding: "10px 18px",
  borderRadius: 12,
  border: "none",
  boxShadow: "0 0 20px rgba(111,230,151,0.4)",
  color: "white",
  fontWeight: 600
}}>
        + Add New Job
      </button>


      <button
       onClick={() => {
        localStorage.removeItem("token");
        window.location.href = "/";
       }}
      style={{
          background: "linear-gradient(180deg, rgba(235,103,103,1), rgba(195,63,63,1))",
           padding: "10px 16px",
           borderRadius: 10,
           border: "none",
           boxShadow: "0 0 20px rgba(235,103,103,0.4)",
           color: "white"
         }}
>
  Logout
</button>
    </div>
  );
}

export default Topbar;