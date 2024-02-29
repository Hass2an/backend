import dotenv from "dotenv"
import connectionDB from "./db/index.js";
import app from "./app.js";
dotenv.config({
    path: "./env"
})

connectionDB()
.then(()=>{
    app.listen(process.env.PORT || 4000,()=>{
        console.log(`Server is listening on ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MongoDB connection failed", err);
})