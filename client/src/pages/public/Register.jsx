import { useState } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";

function Register() {

  const navigate = useNavigate();

  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading] = useState(false);

  const handleRegister = async () => {

    if(!email.includes("@")){
alert("Invalid email");
return;
}

if(password.length < 6){
alert("Password must be at least 6 characters");
return;
}
    try{

      setLoading(true);

      const res = await API.post("/users/register",{
        name,
        email,
        password
      });

      alert(res.data.message || "User registered successfully");

      navigate("/login");

    }catch(err){

      console.error(err);

      alert(
        err.response?.data?.message ||
        err.message ||
        "Registration failed"
      );

    }finally{
      setLoading(false);
    }

  };

  return(

    <div style={{
      minHeight:"100vh",
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      background:"linear-gradient(135deg,#020617,#0f172a)",
      color:"white"
    }}>

      <div style={{
        width:360,
        background:"#111827",
        padding:35,
        borderRadius:12,
        boxShadow:"0 10px 40px rgba(0,0,0,0.6)"
      }}>

        <h2 style={{
          marginBottom:25,
          textAlign:"center"
        }}>
          Create Account
        </h2>

        <input
          placeholder="Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          style={{
            width:"100%",
            padding:12,
            marginBottom:12,
            borderRadius:6,
            border:"none"
          }}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          style={{
            width:"100%",
            padding:12,
            marginBottom:12,
            borderRadius:6,
            border:"none"
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          style={{
            width:"100%",
            padding:12,
            marginBottom:20,
            borderRadius:6,
            border:"none"
          }}
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          style={{
            width:"100%",
            padding:12,
            background:"#22c55e",
            border:"none",
            borderRadius:6,
            fontWeight:"bold",
            cursor:"pointer"
          }}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

      </div>

    </div>

  )

}

export default Register;