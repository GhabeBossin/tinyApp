//TinyApp by Ghabe Bossin

// default port 8080
const PORT = 8080;
//added randomString npm package for key generation found here: https://www.npmjs.com/package/randomstring
const randomString = require('randomstring');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

//generates random 6 character alphanumberic string
function genRandomString(num) {
  const ranString = randomString.generate(num);
  return ranString;
}

const userData = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};

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
    user_id: request.cookies['user_id']
  };
  response.render('urls_index', templateVars);
});

//creates registration page
app.get('/register', (request, response) => {
  //console.log('WOO');
  response.render('urls_register');
});

//on POST from /register, stores email and password inputs.
app.post('/register', (request, response) => {
  let genID = genRandomString(14);
  let userKeys = Object.keys(userData);

  if(request.body.email && request.body.password) {
    let matched = false;
    for(let key of userKeys) {
      if(userData[key].email === request.body.email) {
        response.status(400);
        response.send('THIEF : ' + 400);
        matched = true;
        break;
      }
    }
    if (!matched) {
      userData[genID] = {
        id: genID,
        email: request.body.email,
        password: request.body.password
      };
      response.status('200');
      response.cookie('user_id', genID);
      response.redirect('/urls');
    }
  } else {
    response.status(400);
    response.send('You shall not pass! : ' + 400);
  }
  //if that email already exists in userData, cannot register again with that email.
  // if (email [alredy exists], err)
  /////// NOT IN USE
  // console.log('Testing:', request.body);
  //console.log('Test uD Val: ', userData[genID].password);
  // if(userData[genID].email == '' || userData[genID].password == '') {
  //   response.status(400);
  //   response.send('You shall not pass! : ' + 400);
  // }

  // console.log(request.body.email);
  // console.log(request.body.password);
  // console.log(userData);
  // console.log('user_id', genID);

});

app.post('/login', (request, response) => {
  
  response.redirect('/urls');
});

//on POST from _header form login, creates cookie storing user_id input
app.post('/login', (request, response) => {
  //console.log(request.body.user_id);
  response.cookie('user_id', request.body.user_id);
  response.redirect('/urls');
});

//on POST from _header form logout, clearCookies and logout
app.post('/logout', (request, response) => {
  //console.log(request.body.user_id);
  response.clearCookie('user_id', request.body.user_id);
  response.redirect('/urls');
});

//on POST generates new key and adds it to urlDatabase, then redirects to new URL based on key
app.post('/urls', (request, response) => {
  let newKey = genRandomString(6);
  //console.log(newKey);
  //console.log(urlDatabase);
  urlDatabase[newKey] = request.body.longURL;
  response.redirect(`/urls/${newKey}`);
});

app.get('/urls/new',(request, response) => {
  let templateVars = {
    user_id: request.cookies['user_id']
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
    user_id: request.cookies['user_id']
  };
  response.render('urls_show', templateVars);
});

//POST response to update/edit existing URLs
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





