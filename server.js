const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser'); 
const app = express();

const port = 3000; 


app.use(session({
  secret: 'asdfasdf',
  resave: false,
  saveUninitialized: false
}));


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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
