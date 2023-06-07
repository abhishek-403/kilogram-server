const dotenv = require('dotenv')
dotenv.config('./.env')


const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser')
const cloudinary = require('cloudinary').v2;

app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())

let origin = 'http://localhost:3000';

if (process.env.NODE_ENV?.trim() === "production") {
  origin = process.env.CLIENT_URL
}
app.use(cors({
  credentials: true,
  origin
}))





// Configuration 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});




const mongoDb = require('./dbConnect')
mongoDb();


const port = process.env.PORT || 4001;

const mainRouter = require('./routers')

app.use('/api', mainRouter)

app.listen(port, () => {
  console.log("Listening at", port);
})