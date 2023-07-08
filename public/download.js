const express = require('express');
const ytdl = require('ytdl-core');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 3001;

const assetFolderPath = 'public/assets';

function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
  }
}

deleteFolderRecursive(assetFolderPath);

const upload = multer({ dest: 'public/assets/' });



app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // 모든 도메인에서 접근 가능하도록 설정
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, file-id,image-count, Access-Control-Allow-Origin");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Add the OPTIONS method
    next();
});
app.get('/', (req, res) => {
  res.send('Server is running!');
});
app.post('/save-image', upload.single('image'), (req, res) => {
    if (!req.file) {
      res.status(400).send('No image file found.');
      return;
    }
    console.log("req:  "+req.file.path);
    const imageCount = req.headers['image-count'];
    const fileid = req.headers['file-id']+'/';
    console.log("fileid  "+fileid);
    const newFileName = `test${imageCount}.png`;
    const newFolderPath = path.join(__dirname,'assets/',fileid);
  const newFilePath = path.join(newFolderPath, newFileName);
  try {
    fs.mkdirSync(newFolderPath, { recursive: true });
    fs.writeFileSync(newFilePath, fs.readFileSync(req.file.path));
    console.log('Image saved successfully.');
    console.log("filepath:"+req.file.path);
    // Unlink the temporary file
    fs.unlinkSync(req.file.path);


    res.status(200).send('Image saved successfully.');
  } catch (err) {
    console.error('Error saving image:', err);
    res.status(500).send('Error saving the image.');
  }
    

  });

  app.get('/reset', (req, res) => {
    
fs.readdir(assetFolderPath, (err, files) => {
  if (err) {
    console.error('An error occurred while reading the asset folder:', err);
    return;
  }

  files.forEach((file) => {
    const filePath = path.join(assetFolderPath, file);

    fs.unlink(filePath, (error) => {
      if (error) {
        console.error('An error occurred while deleting the file:', error);
      } else {
        console.log(`Deleted file: ${filePath}`);
      }
    });
  });
  res.status(200).send('Asset files have been deleted successfully.');
});
  });
app.get('/download', (req, res) => {

    console.log(req.query.url);
    const url = req.query.url;
    fs.unlink('public/video3.mp4', (err) => {
        if (err) {
          console.error('Error deleting the file:', err);
          // Handle the error accordingly
        } else {
          console.log('File deleted successfully');
          // Proceed with further actions
        }
      });
    if (!url) {
        return res.status(400).send('Please provide a valid YouTube URL.');
      }
    
      // Validate YouTube URL
      if (!ytdl.validateURL(url)) {
        return res.status(400).send('Invalid YouTube URL.');
      }
      
      ytdl(url)
        .pipe(fs.createWriteStream('public/video3.mp4'))
        .on('finish', () => {
            res.send('Successful!');
            console.log('Download Successful');
        })
        .on('error', (err) => {
            console.error('Error:', err);
            res.status(500).send('An error occurred during the download process.');
        });
      
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});