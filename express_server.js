const PORT = 8080; // default port 8080
//added randomString npm package for key generation found here: https://www.npmjs.com/package/randomstring
const randomString = require('randomstring');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

function genRandomString() {
  const ranString = randomString.generate(6);
  return ranString;
}


const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
  //dynamically generated keys from the genRandomString called in the /urls POST added here
};

app.get('/', (request, response) => {
  response.send('Hello!');
});

app.get('/urls.json', (request, response) => {
  response.json(urlDatabase);
});

app.get('/urls', (request, response) => {
  let templateVars = {
    urls: urlDatabase,
    username: request.cookies['username']
  };
  response.render('urls_index', templateVars);
});

app.post('/login', (request, response) => {
  response.cookie('username', request.body.username);
  response.redirect('/urls');
});
//on POST generates new key and adds it to urlDatabase, then redirects to new URL based on key.
app.post('/urls', (request, response) => {
  let newKey = genRandomString();
  urlDatabase[newKey] = request.body.longURL;
  response.redirect(`/urls/${newKey}`);
});

// app.get('/login', (request, response) => {
//   // Cookies that have not been signed\
//   let templateVars = { urls: urlDatabase };
//   response.render('/urls_login', templateVars);
// });

app.get('/urls/new',(request, response) => {
  let templateVars = {
    username: request.cookies['username']
  };
  response.render('urls_new', templateVars);
});

app.get('/u/:shortURL', (request, response) => {
  let longURL = urlDatabase[request.params.shortURL];
  response.redirect(longURL);
});

app.get('/urls/:id', (request, response) => {
  let templateVars = {
    shortURL: request.params.id,
    longURL: urlDatabase[request.params.id],
    username: request.cookies['username']
  };
  response.render('urls_show', templateVars);
});

//frame for post response to UPDATE
app.post('/urls/:id/update', (request, response) => {
  let updatedURL = request.params.id;
  urlDatabase[updatedURL] = request.body.longURL;
  response.redirect('/urls');
});

//on POST response (from delete input), delete URL and refresh page
app.post('/urls/:id/delete', (request, response) => {
  let urlToDelete = request.params.id;
  delete urlDatabase[urlToDelete];
  response.redirect('/urls');
});

app.get('/hello', (request, response) => {
  response.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





