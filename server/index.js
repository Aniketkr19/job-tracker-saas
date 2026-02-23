const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

const userRoutes = require("./routes/userRoutes");

app.use("/api", userRoutes);

app.get("/", (req,res)=>{
    res.send("API Running");
});

app.listen(5000, ()=> console.log("Server running"));