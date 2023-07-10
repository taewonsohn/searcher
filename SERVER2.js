const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser'); 
const ytdl = require('ytdl-core');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const puppeteer = require('puppeteer');
const app = express();

const port = 3000; 

const { uploadFile, downloadFile } = require('./s3');
const assetFolderPath = 'public/assets';

const upload = multer({ dest: 'public/assets/' });


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
    }
  }
  
  deleteFolderRecursive(assetFolderPath);
  
  
  

app.use(session({
  secret: 'asdfasdf',
  resave: false,
  saveUninitialized: false
}));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // 모든 도메인에서 접근 가능하도록 설정
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,file-id,user-id, Content-Type, Accept, image-count, Access-Control-Allow-Origin");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Add the OPTIONS method
    next();
  });
  app.get('/puppeteer', async (req, res) => {
    try {
      const response = await openGoogle(req.headers['user-id'],req.headers['file-id']); // Assuming openGoogle() returns a Promise with the desired response
      res.send(response);
      console.log(response);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }
  });

app.use(bodyParser.urlencoded({ extended: true }));


function isAuthenticated(req, res, next) {
  if (req.session.authenticated) {

    next();
  } else {

    res.redirect('/login');
  }
}


app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});


app.post('/authenticate', (req, res) => {
  const { password } = req.body;
  

  if (password === '2330') {

    req.session.authenticated = true;
    res.redirect('/');
  } else {
    res.redirect('/login'); 
  }
});

app.use(isAuthenticated, express.static('public'));

app.post('/save-image', upload.single('image'), (req, res) => {
    if (!req.file) {
      res.status(400).send('No image file found.');
      return;
    }
    const fileid = req.headers['file-id'];
    const userid = req.headers['user-id']+'/';
    
    console.log("user id :  "+userid);
    const newFileName = `${fileid}.png`;
    const newFolderPath = path.join(__dirname,'public/assets/',userid);
  const newFilePath = path.join(newFolderPath, newFileName);
  try {
    fs.mkdirSync(newFolderPath, { recursive: true });
    fs.writeFileSync(newFilePath, fs.readFileSync(req.file.path));
    const FILE = {path:newFilePath,filename:userid+fileid+'.png'};
    const result = uploadFile(FILE);
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
app.get('/erase',(req,res)=>{
  fs.unlink('public/video3.mp4', (err) => {
    if (err) {
      console.error('Error deleting the file:', err);
      // Handle the error accordingly
    } else {
      console.log('File deleted successfully');
      // Proceed with further actions
    }
  })
});
app.get('/download', (req, res) => {

    console.log(req.query.url);
    const url = req.query.url;
    if (!url) {
      return res.status(400).send('Please provide a valid YouTube URL.');
    }
  
    // Validate YouTube URL
    if (!ytdl.validateURL(url)) {
      return res.status(400).send('Invalid YouTube URL.');
    }
    fs.unlink('public/video3.mp4', (err) => {
        if (err) {
          console.error('Error deleting the file:', err);
          // Handle the error accordingly
        } else {
          console.log('File deleted successfully');
          // Proceed with further actions
          
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
          
      
    
      
      
      
});
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});




async function openGoogle(userid, fileid) {
    // Launch a new browser instance
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://www.google.co.kr/imghp?hl=ko');
      try {
        await page.evaluate(() => {
          const element = document.getElementsByClassName('nDcEnd')[0];
          if (element) {
            element.click();
          }
        });
          console.log('Successfully clicked the div element!');
        } catch (error) {
        console.error('Error: Failed to find or click the div element:', error);
        }
      await page.waitForSelector('input[type="file"]');
      const fileInput = await page.$('input[type="file"]');
  
      const imagePath = path.join(__dirname,'public/assets/'+userid,`${fileid}.png`);
      await fileInput.uploadFile(imagePath);
      await page.waitForNavigation();
      let url = page.url();
      let count = 0;
      while(url.length<400&&count<500){
        await page.waitForTimeout(50);
        count++;
        url = page.url();
      }
      browser.close();
      
      return url;
    
    
    // Optionally, you can perform additional actions on the page, such as typing in the search bar or clicking on elements.
    //await page.click('div[data-ved="0ahUKEwiFzKWLqOj_AhUYA4gKHfDoAXMQhqEICAY"]');
    // Wait for a few seconds (optional)
    
  
  
    // Wait for the visual search results to load
   
  
    // Close the browser
    //await browser.close();
  }