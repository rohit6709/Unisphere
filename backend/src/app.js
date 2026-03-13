import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import csvRouter from './routers/csv.routes.js';
import userRouter from './routers/auth.routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());


app.use('/api/v1/admin', csvRouter);
app.use('/api/v1/user', userRouter);



export default app;