function StatCard({ label, value }) {

const gradients = {
Applied:"linear-gradient(135deg,#43A9FA,#1472DB)",
Interview:"linear-gradient(135deg,#B27EFA,#8042DB)",
Offers:"linear-gradient(135deg,#F2D250,#CFA524)",
Rejected:"linear-gradient(135deg,#C43C3C,#961E1E)"
};

const glow = {
Applied:"rgba(67,169,250,0.4)",
Interview:"rgba(178,126,250,0.4)",
Offers:"rgba(242,210,80,0.4)",
Rejected:"rgba(196,60,60,0.4)"
};

return(

<div
style={{
flex:1,
padding:26,
borderRadius:18,
background:gradients[label],
boxShadow:`0 12px 30px ${glow[label]}`,
color:"white",
border:"1px solid rgba(255,255,255,0.1)",
transition:"0.25s"
}}

onMouseEnter={(e)=>e.currentTarget.style.transform="translateY(-4px)"}
onMouseLeave={(e)=>e.currentTarget.style.transform="translateY(0)"}

>

<h2 style={{
margin:0,
fontSize:34,
fontWeight:700
}}>
{value}
</h2>

<p style={{
marginTop:6,
fontSize:14,
opacity:0.85
}}>
{label}
</p>

</div>

);

}

export default StatCard;