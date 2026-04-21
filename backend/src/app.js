import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import studentRouter from './routers/studentAuth.routes.js';
import facultyRouter from './routers/facultyAuth.routes.js';
import adminRouter from './routers/adminAuth.routes.js';
import clubRouter from './routers/club.routes.js';
import eventRouter, { clubEventRouter } from './routers/event.routes.js';
import registrationRouter from './routers/registration.routes.js';
import chatRouter from './routers/chat.routes.js';
import notificationRouter from './routers/notification.routes.js';
import onboardingRouter from './routers/onboarding.routes.js';
import dashboardRouter from './routers/dashboard.routes.js';
import clubProfileRouter from './routers/clubProfile.routes.js';
import clubTagsRouter from './routers/clubTags.routes.js';
import noticeRouter from './routers/notice.routes.js';
import { initEventCron } from './controllers/event.controller.js';

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

// -- student
app.use('/api/v1/students', onboardingRouter);
app.use('/api/v1/students', dashboardRouter);
// 

//Club routes
app.use('/api/v1/clubs', clubRouter);
app.use('/api/v1/clubs', clubProfileRouter);
app.use('/api/v1/clubs', clubTagsRouter);

//Club scoped event routes
app.use('/api/v1/clubs/:clubId/events', clubEventRouter);

//Flat event routes
app.use('/api/v1/events', eventRouter);

//Registration routes
app.use('/api/v1/event-registrations', registrationRouter);

//Chat routes
app.use('/api/v1/chat', chatRouter);

// Notification routes
app.use('/api/v1/notifications', notificationRouter);

app.use('/api/v1/notices', noticeRouter);

app.get('/api/v1', (req, res) => {
    res.send('Welcome to Unisphere API');
})

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`
    })
})

export { initEventCron };
export default app;