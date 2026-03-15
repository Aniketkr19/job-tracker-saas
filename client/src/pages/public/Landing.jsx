import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../../api/axios";

import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

function Landing(){

const navigate = useNavigate();

const [showLogin,setShowLogin] = useState(false);
const [showSignup,setShowSignup] = useState(false);

const [email,setEmail] = useState("");
const [password,setPassword] = useState("");

const [name,setName] = useState("");
const [signupEmail,setSignupEmail] = useState("");
const [signupPassword,setSignupPassword] = useState("");

// LOGIN
const handleLogin = async () => {

try{

const res = await API.post("/users/login",{ email,password });

localStorage.setItem("token",res.data.token);

setEmail("");
setPassword("");

navigate("/dashboard");

}catch(err){

alert(err.response?.data?.message || "Login failed")

}

};

// REGISTER
const handleRegister = async () => {

try{

await API.post("/users/register",{
name,
email:signupEmail,
password:signupPassword
});

alert("Account created");

setName("");
setSignupEmail("");
setSignupPassword("");

setShowSignup(false);

}catch(err){

alert(err.response?.data?.message || "Registration failed")

}

};

return(

<div style={{
minHeight:"100vh",
background:"linear-gradient(135deg,#020617,#020617,#0f172a)",
color:"white"
}}>

<Header

openLogin={()=>{
setEmail("");
setPassword("");
setShowLogin(true);
}}
openSignup={()=>{
setName("");
setSignupEmail("");
setSignupPassword("");
setShowSignup(true);
}}
/>


{/* HERO SECTION */}

<div style={{
display:"flex",
flexWrap:"wrap",
justifyContent:"space-between",
alignItems:"center",
padding:"120px 8%",
gap:40
}}>

<motion.div
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
transition={{duration:0.7}}

>

<h1 style={{
fontSize:"clamp(36px, 6vw, 72px)",
fontWeight:"700",
lineHeight:"1.1"
}}>
Track Your <br/> Career Velocity 🚀
</h1>

<p style={{
marginTop:"20px",
maxWidth:"500px",
color:"#94a3b8",
fontSize:"18px"
}}>
Track applications, interviews, and offers in one beautiful
dashboard built for developers and job seekers.
</p>

<button
onClick={()=>{
setName("");
setSignupEmail("");
setSignupPassword("");
setShowSignup(true);
}}
style={{
marginTop:"30px",
padding:"16px 34px",
background:"linear-gradient(135deg,#34d399,#22c55e)",
border:"none",
borderRadius:"12px",
fontWeight:"bold",
fontSize:"16px",
cursor:"pointer",
boxShadow:"0 0 20px rgba(52,211,153,0.5)"
}}

>

Get Started </button>

</motion.div>

{/* GLASS LOGIN CARD */}

<motion.div
initial={{opacity:0,x:40}}
animate={{opacity:1,x:0}}
transition={{duration:0.7}}
style={{
width:"380px",
padding:"30px",
borderRadius:"20px",
background:"rgba(255,255,255,0.05)",
backdropFilter:"blur(20px)",
border:"1px solid rgba(255,255,255,0.08)"
}}

>

<h3>Login</h3>

{/* Change these lines in your Login Modal section */}
<input
  placeholder="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  style={{
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.1)", // Light border
    background: "#1f2937", // Darker background for the input
    color: "white", // THIS MAKES THE TEXT VISIBLE
    outline: "none",
    boxSizing: "border-box"
  }}
/>

<input
  type="password"
  placeholder="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  style={{
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "#1f2937",
    color: "white", // THIS MAKES THE TEXT VISIBLE
    outline: "none",
    boxSizing: "border-box"
  }}
/>

<button
onClick={handleLogin}
style={{
width:"100%",
marginTop:"14px",
padding:"12px",
background:"#22c55e",
border:"none",
borderRadius:"8px",
fontWeight:"bold"
}}

>

Log In </button>

</motion.div>

</div>

{/* FEATURES SECTION */}

<div className="container" style={{
padding:"80px 0"
}}>

<h2 style={{
textAlign:"center",
marginBottom:"60px",
fontSize:"36px"
}}>
Powerful Features
</h2>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit, minmax(250px,1fr))",
gap:"30px"
}}>

{[
"Track all job applications",
"Visual application pipeline",
"Interview calendar",
"Analytics dashboard",
"Notes & preparation",
"Secure login system"
].map((feature,index)=>(

<div key={index} style={{
padding:"30px",
borderRadius:"16px",
background:"rgba(255,255,255,0.04)",
border:"1px solid rgba(255,255,255,0.08)"
}}>
{feature}
</div>

))}

</div>

</div>

{/* LOGIN MODAL */}

{showLogin && (

<div style={{
position:"fixed",
top:0,
left:0,
width:"100%",
height:"100%",
background:"rgba(0,0,0,0.7)",
display:"flex",
justifyContent:"center",
alignItems:"center",
zIndex:200
}}>

<div style={{
  width:"90%",
  maxWidth:"400px",
  background:"#111827",
  padding:"30px",
  borderRadius:"12px",
  position:"relative"
}}>

<span
onClick={()=>{
setEmail("");
setPassword("");
setShowLogin(false);
}}
style={{
position:"absolute",
top:"10px",
right:"15px",
cursor:"pointer",
fontSize:"18px"
}}

>

✖ </span>

<h3>Login</h3>

<input
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
style={{width:"100%",padding:"10px",marginTop:"10px"}}
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
style={{width:"100%",padding:"10px",marginTop:"10px"}}
/>

<button
onClick={handleLogin}
style={{
width:"100%",
marginTop:"15px",
padding:"10px",
background:"#22c55e",
border:"none"
}}

>

Login </button>

</div>

</div>

)}

{/* SIGNUP MODAL */}

{showSignup && (

<div style={{
position:"fixed",
top:0,
left:0,
width:"100%",
height:"100%",
background:"rgba(0,0,0,0.7)",
display:"flex",
justifyContent:"center",
alignItems:"center",
zIndex:200
}}>

<div style={{
width:"90%",
maxWidth:"400px",
background:"#111827",
padding:"30px",
borderRadius:"12px",
position:"relative"
}}>

<span
onClick={()=>{
setName("");
setSignupEmail("");
setSignupPassword("");
setShowSignup(false);
}}
style={{
position:"absolute",
top:"10px",
right:"15px",
cursor:"pointer",
fontSize:"18px"
}}

>

✖ </span>

<h3>Create Account</h3>

{/* Change these lines in your Signup Modal section */}
<input
  placeholder="Name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  style={{
    width: "100%", 
    padding: "12px", 
    marginTop: "10px",
    background: "#1f2937",
    color: "white", // Ensure text is white
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    boxSizing: "border-box"
  }}
/>

<input
  placeholder="Email"
  value={signupEmail}
  onChange={(e) => setSignupEmail(e.target.value)}
  style={{
    width: "100%", 
    padding: "12px", 
    marginTop: "10px",
    background: "#1f2937",
    color: "white", // Ensure text is white
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    boxSizing: "border-box"
  }}
/>

<input
  type="password"
  placeholder="Password"
  value={signupPassword}
  onChange={(e) => setSignupPassword(e.target.value)}
  style={{
    width: "100%", 
    padding: "12px", 
    marginTop: "10px",
    background: "#1f2937",
    color: "white", // Ensure text is white
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    boxSizing: "border-box"
  }}
/>

<button
onClick={handleRegister}
style={{
width:"100%",
marginTop:"15px",
padding:"10px",
background:"#22c55e",
border:"none"
}}

>

Sign Up </button>

</div>

</div>

)}

<Footer/>

</div>

)

}

export default Landing
