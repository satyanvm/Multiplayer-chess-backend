import express from "express"
import cors from "cors"
const app = express()
// import authroute from "./auth/auth"
const PORT = 8080;

app.use(express.json())

app.use(cors())

// app.use('/auth', authroute)


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
