import dotenv from 'dotenv';
dotenv.config({
    path: './.env'
});

import connectDB from './config/db.js';
import app, { initEventCron } from './app.js';

const startServer = async () => {
    try{
        await connectDB();
        console.log("Database connected");

        app.listen(process.env.PORT || 5000, (err) => {
            if(err){
                console.log("Server failed to start: ", err);
            }
            else{
                console.log(`Server started on port ${process.env.PORT || 5000}`);
                initEventCron();
            }
        })
    }
    catch(err){
        console.log("Failed to start server: ", err);
        process.exit(1);
    }
}

startServer();