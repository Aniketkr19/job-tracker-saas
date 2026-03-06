import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import Login from "../public/Login";

function Landing() {
  return (
    <>
      <Header />

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        padding: 60
      }}>
        <div>
          <h1>Track Your Career Velocity</h1>
          <p>The modern platform for mindful career progression.</p>
        </div>

        <Login />
      </div>

      <Footer />
    </>
  );
}

export default Landing;