const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const express = require('express');


const  app = express();
const port = 3002;


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

    const imagePath = path.join(__dirname,'assets/'+userid,`${fileid}.png`);
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

// Call the function to open Google

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // 모든 도메인에서 접근 가능하도록 설정
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,file-id,user-id, Content-Type, Accept, image-count, Access-Control-Allow-Origin");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Add the OPTIONS method
  next();
});
app.get('/', async (req, res) => {
  try {
    const response = await openGoogle(req.headers['user-id'],req.headers['file-id']); // Assuming openGoogle() returns a Promise with the desired response
    res.send(response);
    console.log(response);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});