import {v2 as cloudinary} from "cloudinary"
import { Router } from "express";
import multer from "multer"
import fs from 'fs'
import dotenv from 'dotenv'


const router = Router()

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });
dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  });

//   console.log(process.env.CLOUD_NAME,process.env.API_KEY,process.env.API_SECRET)

//   console.log(process.env.CLOUD_NAME,'ff')
  const mergeChunks = async (fileName, totalChunks) => {
    const chunkDir = __dirname + "/chunks";
    const mergedFilePath = __dirname + "/merged_files";
  
    if (!fs.existsSync(mergedFilePath)) {
      fs.mkdirSync(mergedFilePath);
    }
  
    const writeStream = fs.createWriteStream(`${mergedFilePath}/${fileName}`);
    for (let i = 0; i < totalChunks; i++) {
      const chunkFilePath = `${chunkDir}/${fileName}.part_${i}`;
      const chunkBuffer = await fs.promises.readFile(chunkFilePath);
      writeStream.write(chunkBuffer);
      console.log(chunkFilePath,i)
       fs.unlinkSync(chunkFilePath); // Delete the individual chunk file after merging
    }
  
    writeStream.end();
    console.log("Chunks merged successfully");
  };


  const mergeChunks1 = async (fileName, totalChunks) => {
    const chunkDir = __dirname + "/chunks";
    const mergedFilePath = __dirname + "/merged_files";

    if (!fs.existsSync(mergedFilePath)) {
        fs.mkdirSync(mergedFilePath);
    }

    const writeStream = fs.createWriteStream(`${mergedFilePath}/${fileName}`);
    for (let i = 0; i < totalChunks; i++) {
        const chunkFilePath = `${chunkDir}/${fileName}.part_${i}`;
        // const chunkBuffer = await fs.promises.readFile(chunkFilePath);
        let chunkBuffer
        try {
            // const chunkBuffer = await fs.promises.readFile(chunkFilePath);
             chunkBuffer = fs.readFileSync(chunkFilePath);

            console.log(`Chunk ${i} Content Size:`, chunkBuffer.length);
        } catch (error) {
            console.error(`Error reading chunk ${i}:`, error);
        }
        
        writeStream.write(chunkBuffer);
//         const mergedFileContent = await fs.promises.readFile(`${mergedFilePath}/${fileName}`, 'utf-8');
// console.log('Merged File Content:', mergedFileContent);
// console.log('Merged File Size:', mergedFileContent.length);

        console.log(chunkFilePath, i);
        fs.unlinkSync(chunkFilePath); // Delete the individual chunk file after merging
    }

    writeStream.end();
    console.log("Chunks merged successfully");

    const mergedFileSize = fs.statSync(`${mergedFilePath}/${fileName}`).size;
    console.log('Merged File Size:', mergedFileSize);

    return `${mergedFilePath}/${fileName}`;
};

//Chunk Upload api with cloudinary upload file
  router.post('/upload', upload.single('file'), async (req, res) => {
    console.log('Hit');
    const chunk = req.file.buffer;
    const chunkNumber = Number(req.body.chunkNumber); // Sent from the client
    const totalChunks = Number(req.body.totalChunks); // Sent from the client
    const fileName = req.body.originalname;
  
    const chunkDir = __dirname + '/chunks'; // Directory to save chunks
  
    if (!fs.existsSync(chunkDir)) {
      fs.mkdirSync(chunkDir);
    }
    const chunkFilePath = `${chunkDir}/${fileName}.part_${chunkNumber}`;
  
    try {
      await fs.promises.writeFile(chunkFilePath, chunk);
      console.log(`Chunk ${chunkNumber}/${totalChunks} saved`);
  
      if (chunkNumber === totalChunks-1) {
        // If this is the last chunk, merge all chunks into a single file
        await mergeChunks(fileName, totalChunks);
  
        // Upload the merged file to Cloudinary
      //  console.log(  fs.existsSync(`${__dirname}/merged_files/${fileName}`),'file')
      //  const byteArrayBuffer = await fs.promises.readFile(`${__dirname}/merged_files/${'cat-551554_1280.jpg'}`);
       const byteArrayBuffer = await fs.promises.readFile(`${__dirname}/merged_files/${fileName}`);
       //  const a = fs.existsSync(`${__dirname}/merged_files/${'cat-551554_1280.jpg'}`)
       console.log('ddd',byteArrayBuffer)
         const upload =  new Promise((resolve,reject) => {
    cloudinary.uploader.upload_stream((error, uploadResult) => {
        if(error){
             return reject(error)
        }
        return resolve(uploadResult);
    }).end(byteArrayBuffer);
}).then((uploadResult) => {
  console.log(uploadResult)
    console.log(`Buffer upload_stream wth promise success - ${uploadResult.public_id}`);
    
}).catch((err)=>{
    console.log(err,'err')
});
    // console.log(uploadResult,'result')
        // const cloudinaryUploadResult = await cloudinary.uploader.upload(`${__dirname}/merged_files/${fileName}`, {
        //   folder: 'cloudinary_uploads', // optional folder in Cloudinary
        // });
      
  
        // Optionally, you can delete the merged file from the server after uploading to Cloudinary
        // fs.unlinkSync(`${__dirname}/merged_files/${fileName}`);
  
        console.log('File merged and uploaded to Cloudinary successfully');
      }
  
      res.status(200).json({ message: 'Chunk uploaded successfully' });
    } catch (error) {
      console.error('Error saving chunk:', error);
      res.status(500).json({ error: 'Error saving chunk' });
    }
  });


  router.post('/upload1', upload.single('file'), async (req, res) => {
    console.log('Hit');
    const chunk = req.file.buffer;
    const chunkNumber = Number(req.body.chunkNumber); // Sent from the client
    const totalChunks = Number(req.body.totalChunks); // Sent from the client
    const fileName = req.body.originalname;

    const chunkDir = __dirname + '/chunks'; // Directory to save chunks

    if (!fs.existsSync(chunkDir)) {
        fs.mkdirSync(chunkDir);
    }
    const chunkFilePath = `${chunkDir}/${fileName}.part_${chunkNumber}`;

    try {
        await fs.promises.writeFile(chunkFilePath, chunk);
        console.log(`Chunk ${chunkNumber}/${totalChunks} saved`);

        if (chunkNumber === totalChunks - 1) {
            // If this is the last chunk, merge all chunks into a single file
            const mergedFilePath = await mergeChunks1(fileName, totalChunks);

            // Upload the merged file to Cloudinary
            const uploadStream = cloudinary.uploader.upload_stream((error, uploadResult) => {
                if (error) {
                    console.error('Cloudinary Upload Error:', error);
                    res.status(500).json({ error: 'Error uploading to Cloudinary' });
                } else {
                    console.log('Cloudinary Upload Success:', uploadResult);
                    // Optionally, you can delete the merged file from the server after uploading to Cloudinary
                    // fs.unlinkSync(mergedFilePath);
                    console.log('File merged and uploaded to Cloudinary successfully');
                    res.status(200).json({ message: 'File uploaded to Cloudinary successfully' });
                }
            });
              
            const readStream = fs.createReadStream(mergedFilePath);
            readStream.pipe(uploadStream);
        } else {
            res.status(200).json({ message: 'Chunk uploaded successfully' });
        }
    } catch (error) {
        console.error('Error saving chunk:', error);
        res.status(500).json({ error: 'Error saving chunk' });
    }
});

// Direct upoad file from directory to cloudinary
router.get('/cloud',(req,res)=>{
  const byteArrayBuffer = fs.readFileSync(`${__dirname}/merged_files/${'2.png'}`);
  //  const a = fs.existsSync(`${__dirname}/merged_files/${'cat-551554_1280.jpg'}`)
  console.log('ddd',byteArrayBuffer)
 const upload =  new Promise((resolve) => {
    cloudinary.uploader.upload_stream((error, uploadResult) => {
        if(error){
            console.log(error,'err')
        }
        return resolve(uploadResult);
    }).end(byteArrayBuffer);
}).then((uploadResult) => {
  console.log(uploadResult,'dd')
    // console.log(`Buffer upload_stream wth promise success - ${uploadResult.public_id}`);
    
}).catch((err)=> console.log(err,'err'));
  res.send({hello:"upload"})
})



//Test route of this section
router.get("/chunktest",(req,res)=>{
    res.send('hello chunk')
})

  export default router