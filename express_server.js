
const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const randomString = require("randomstring");
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

function genRandomString() {
  //found package here: https://www.npmjs.com/package/randomstring
  const ranString = randomString.generate(6);
  return ranString;
}

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

app.get('/', (request, response) => {
  response.send('Hello!');
});

app.get('/urls.json', (request, response) => {
  response.json(urlDatabase);
});

app.get('/urls', (request, response) => {
  let templateVars = { urls: urlDatabase };
  response.render('urls_index', templateVars);
});

app.post('/urls', (request, response) => {
  let newKey = genRandomString();
  urlDatabase[newKey] = request.body.longURL;
  response.redirect(`/urls/${newKey}`);
});

app.get('/urls/new',(request, response) => {
  response.render('urls_new');
});

app.get('/u/:shortURL', (request, response) => {
  let longURL = urlDatabase[request.params.shortURL];
  response.redirect(longURL);
});

app.get('/urls/:id', (request, response) => {
  let templateVars = {
    shortURL: request.params.id,
    longURL: urlDatabase[request.params.id]
  };
  response.render('urls_show', templateVars);
});

app.post('/urls/:id/delete', (request, response) => {
  let urlToDelete = [request.params.id];
  console.log('TEST: ', urlToDelete);
  //delete urlToDelete;
  delete urlDatabase.urlToDelete;
  response.redirect('/urls');
});

app.get('/hello', (request, response) => {
  response.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



