import dotenv from 'dotenv'
import connectDB from './db/index.js';
import { app } from './app.js';
dotenv.config({
    path : './.env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT,() => {
        console.log(`the server is running on ${process.env.PORT}`);
    })
})
.catch((err) =>{
     console.log(`mongodb connection failed due to ${err}`);
})