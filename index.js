
import express from 'express'

// import upload from './upload';
import bodyParser from 'body-parser'
import fs from 'fs'
import multer from "multer"
import cors from 'cors'
import {v2 as cloudinary} from "cloudinary"
import dotenv from 'dotenv'
import chunkUpload from './chunkUpload'

dotenv.config()


const app = express();


app.use('/static',express.static('uploads'))



const PORT = 6001;
const corsOptions = {
  origin: "http://localhost:3000",
};

app.use(cors(corsOptions));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use('/chunk',chunkUpload)

app.get("/healthy", (req, res) => {
  console.log({ req });
  res.send("Hello world");
});



app.listen(PORT, () => {
  console.log(`Port listening on ${PORT}`);
})