import { useState } from "react";

function Header({ openLogin, openSignup }) {

return (

<div style={{
display:"flex",
justifyContent:"space-between",
alignItems:"center",
padding:"20px 80px",
position:"sticky",
top:0,
zIndex:100,
backdropFilter:"blur(12px)",
background:"rgba(2,6,23,0.7)",
borderBottom:"1px solid rgba(255,255,255,0.08)"
}}>

<h2 style={{fontWeight:"700",letterSpacing:"1px"}}>
JobTracker
</h2>

<div style={{
display:"flex",
gap:"30px",
alignItems:"center",
color:"#cbd5f1"
}}>

<span style={{cursor:"pointer"}}>Home</span>
<span style={{cursor:"pointer"}}>Features</span>
<span style={{cursor:"pointer"}}>Analytics</span>

<button
onClick={openLogin}
style={{
padding:"8px 18px",
background:"transparent",
border:"1px solid rgba(255,255,255,0.2)",
borderRadius:"8px",
color:"white",
cursor:"pointer"
}}

>

Login </button>

<button
onClick={openSignup}
style={{
padding:"8px 20px",
background:"linear-gradient(135deg,#34d399,#22c55e)",
border:"none",
borderRadius:"8px",
fontWeight:"600",
cursor:"pointer"
}}

>

Sign Up </button>

</div>

</div>

);

}

export default Header;
