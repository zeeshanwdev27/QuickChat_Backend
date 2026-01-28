import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import http from 'http'
import { connectDB } from './lib/db.js'
import userRouter from './routes/userRoutes.js'


const app = express()
const server = http.createServer(app)
const port = process.env.PORT || 3000


app.use(express.json({ limit: '4mb' }))    //images size limit
app.use(cors())



// routes middleware
app.use('/api/status', (req,res)=> res.send('Server is live!'))
app.use('/api/auth', userRouter )



// Database Connect
await connectDB()


server.listen( port, () => console.log(`Server is running on port ${port}!`) )