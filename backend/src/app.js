import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './routers/auth.routes.js';
import facultyRouter from './routers/faculty.routes.js';
import adminRouter from './routers/admin.routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());


app.use('/api/v1/user', userRouter);
app.use('/api/v1/faculty', facultyRouter);
app.use('/api/v1/admin', adminRouter);

app.get('/api/v1', (req, res) => {
    res.send('Welcome to Unisphere API');
})



export default app;