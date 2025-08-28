import express from "express"
import cors from "cors"
const app = express()
import authroute from "./auth/auth"

app.use(express.json())

app.use(cors())

app.use('/auth', authroute)
