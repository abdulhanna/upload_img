import express from 'express'
import upload from './upload';

const app = express()



app.use('/healthy',(req,res)=>{
    res.send('healthy')
})

app.use('/static',express.static('uploads'))

app.use('/upload',upload.single('image'),(req,res)=>{
    const data = {
        file: req.file,
        name: req.body,
        url:`http://localhost:4000/static/${req.file.filename}`
      };
    res.send(data)
})

const port = 6001
app.listen(port, (err) => {
  if (err) {
    console.log(`could not connect due to ${err}`);
  }
  console.log(`server is running at ${port}`);
});