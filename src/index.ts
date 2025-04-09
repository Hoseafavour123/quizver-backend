import express, {Request, Response} from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import errorHandler from './middleware/errorHandler'
import authUserRoutes from './routes/authUser.route'
import authAdminRoutes from './routes/authAdmin.route'
import userRoutes from './routes/user.route'
import adminRoutes from './routes/admin.route'
import QuizRoutes from './routes/quiz.route'
import paymentRoute from './routes/payment.route'
import sessionRoutes from './routes/session.route'
import connectDB from './config/db'
import cookieParser from 'cookie-parser'
import authenticate from './middleware/authenticate'
import morgan from 'morgan'
import cloudinary from 'cloudinary'
import { createServer } from 'http';
import { initSocket } from "./sockets/socket";
import bodyParser from 'body-parser'


dotenv.config()

const app = express()
const port = process.env.PORT || 4005


app.use(
  cors({
    origin:['https://quizver.vercel.app', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  })
)

app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))

const httpServer = createServer(app);
export const io = initSocket(httpServer); // ✅ Initialize Socket.io


cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})


app.use(morgan('dev'))

app.use('/auth', authUserRoutes)
app.use('/auth/admin', authAdminRoutes)

app.use('/user', authenticate, userRoutes)
app.use('/admin', authenticate, adminRoutes)
app.use('/sessions', authenticate, sessionRoutes)

app.use('/quiz', authenticate, QuizRoutes)

app.use('/payment', authenticate, paymentRoute)

app.use(errorHandler)


httpServer.listen(port, async () => {
  console.log(`Server is running on http://localhost:${port}`)
  await connectDB()
})


export default app