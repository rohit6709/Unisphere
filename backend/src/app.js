import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import studentRouter from './routers/studentAuth.routes.js';
import facultyRouter from './routers/facultyAuth.routes.js';
import adminRouter from './routers/adminAuth.routes.js';
import clubRouter from './routers/club.routes.js';
import eventRouter, { clubEventRouter } from './routers/event.routes.js';
import registrationRouter from './routers/registration.routes.js';
import noticeRouter from './routers/notice.routes.js';
import { initEventCron } from './controllers/event.controller.js';
import chatRouter from './routers/chat.routes.js';

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

// Auth routes
app.use('/api/v1/students', studentRouter);
app.use('/api/v1/faculty', facultyRouter);
app.use('/api/v1/admin', adminRouter);

//Club routes
app.use('/api/v1/clubs', clubRouter);

//Club scoped event routes
app.use('/api/v1/clubs/:clubId/events', clubEventRouter);

//Flat event routes
app.use('/api/v1/events', eventRouter);

//Registration routes
app.use('/api/v1/event-registrations', registrationRouter);

//Chat routes
app.use('/api/v1/chat', chatRouter);

app.use('/api/v1/notices', noticeRouter);

app.get('/api/v1', (req, res) => {
    res.send('Welcome to Unisphere API');
})


export { initEventCron };
export default app;