import dotenv from 'dotenv';
dotenv.config({
    path: './.env'
});

import connectDB from './config/db.js';
import app from './app.js';

connectDB();


app.listen(process.env.PORT || 5000, (err) => {
    if(err){
        console.log("Server failed to start: ", err);
    }
    else{
        console.log(`Server started on port ${process.env.PORT || 5000}`);
    }
})