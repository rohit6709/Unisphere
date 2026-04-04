import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import studentRouter from './routers/studentAuth.routes.js';
import facultyRouter from './routers/facultyAuth.routes.js';
import adminRouter from './routers/adminAuth.routes.js';
import clubRouter from './routers/club.routes.js';
import eventRouter, { clubEventRouter } from './routers/event.routes.js';
import noticeRouter from './routers/notice.routes.js';
import { initEventCron } from './controllers/event.controller.js';

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());


app.use('/api/v1/students', studentRouter);
app.use('/api/v1/faculty', facultyRouter);
app.use('/api/v1/admin', adminRouter);

app.use('/api/v1/clubs', clubRouter);

app.use('/api/v1/clubs/:clubId/events', clubEventRouter);

app.use('/api/v1/events', eventRouter);

app.use('/api/v1/notices', noticeRouter);

app.get('/api/v1', (req, res) => {
    res.send('Welcome to Unisphere API');
})


export { initEventCron };
export default app;