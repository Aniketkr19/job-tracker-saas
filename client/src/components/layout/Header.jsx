function Header() {
  return (
    <header style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "20px 40px",
      borderBottom: "1px solid #ddd"
    }}>
      <h2>JobTracker</h2>

      <nav>
        <button>Dashboard</button>
        <button>Applications</button>
        <button>Sign In</button>
      </nav>
    </header>
  );
}

export default Header;