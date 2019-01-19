//TinyApp by Ghabe Bossin

// default port 8080
const PORT = 8080;
//added randomString npm package for key generation found here: https://www.npmjs.com/package/randomstring
const randomString = require('randomstring');
const bcrypt = require('bcrypt');
//const bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword);
//const hashedPassword = bcrypt.hashSync(request.body.password, 10);
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

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
  'b2xVn2': {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'userRandomID'
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'user2RandomID'
    }
};

//generates random 6 character alphanumberic string
function genRandomString(num) {
  const ranString = randomString.generate(num);
  return ranString;
}

//
function getCurrentUser(email, password) {
  for (let key in userData) {
    if (userData[key].email === email) {
      if (bcrypt.compareSync(password, userData[key].password)) {
        return userData[key];
      }
    }
  }
  return null;
}

function urlsForUser(userID) {
  userURLs = {};
  for (let key in urlDatabase) {
    if (userID === urlDatabase[key].userID) {
      userURLs[key] = urlDatabase[key];
    }
  }
  return userURLs;
}

app.get('/', (request, response) => {
  response.send('Hello');
});

app.get('/urls.json', (request, response) => {
  response.json(urlDatabase);
});

app.get('/register', (request, response) => {
  let templateVars = {
    user_id: request.cookies['user_id']
  };
  response.render('urls_register', templateVars);
});

//on POST from /register, stores email and password inputs, and generates id
app.post('/register', (request, response) => {
  let genID = genRandomString(14);
  let userKeys = Object.keys(userData);

  if (request.body.email && request.body.password) {
    let matched = false;
    for (let key of userKeys) {
      if (userData[key].email === request.body.email) {
        response.status(400);
        response.send('The thieves. The thieves. The filthy little thieves!: This email is belongs to an already registered account! <a href="/register">Try again with a different email.</a>');
        matched = true;
        break;
      }
    }
    if (!matched) {
      userData[genID] = {
        id: genID,
        email: request.body.email,
        password: bcrypt.hashSync(request.body.password, 10)
      };
      response.status('200');
      response.cookie('user_id', genID);
      response.redirect('/urls');
    }
  } else {
    response.status(400);
    response.send('You shall not pass!: You must <a href="/register">enter both a valid email and password</a> to register.');
  }
});

app.get('/login', (request, response) => {
  let templateVars = {
    user_id: request.cookies['user_id']
  };
  response.render('urls_login', templateVars);
});

//on POST from _header form login, creates cookie storing user_id input
app.post('/login', (request, response) => {
  const { email, password } = request.body;
  const currentUser = getCurrentUser(email, password);
  if (!currentUser) {
    response.status(403);
    response.send('Speak "friend", and enter: You must enter the <a href="/login">correct email and password</a> to proceed.');
  }
  // console.log(currentUser);
  response.cookie('user_id', currentUser.id);
  response.redirect('/urls');
});

//on POST from _header form logout, clearCookies and logout
app.post('/logout', (request, response) => {
  response.clearCookie('user_id');
  response.redirect('/urls');
});

app.get('/urls', (request, response) => {
  let templateVars = {
    urls: urlsForUser(request.cookies['user_id']),
    user_id: request.cookies['user_id']
  };
  response.render('urls_index', templateVars);
});

//on POST generates new key and adds it to urlDatabase, then redirects to new URL based on key
app.post('/urls', (request, response) => {
  let newKey = genRandomString(6);
  urlDatabase[newKey] = {
    longURL: request.body.longURL,
    userID: request.cookies['user_id']
  };
  response.redirect(`/urls/${newKey}`);
});

app.get('/urls/new',(request, response) => {
  let templateVars = {
    user_id: request.cookies['user_id']
  };
  if (!request.cookies['user_id']) {
    response.send('There lies our hope, if hope it be: You must be logged in to shorten a new URL! Please <a href="/login">login</a> or <a href="/register">register.</a>');
    //response.redirect('/login');
  } else {
    response.render('urls_new', templateVars);
  }
});

app.get('/u/:shortURL', (request, response) => {
  let longURL = urlDatabase[request.params.shortURL].longURL;
  response.redirect(longURL);
});

app.get('/urls/:id', (request, response) => {
  let templateVars = {
    shortURL: request.params.id,
    longURL: urlDatabase[request.params.id].longURL,
    user_id: request.cookies['user_id']
  };
  if (request.cookies['user_id']) {
    response.render('urls_show', templateVars);
  } else {
    response.send('Naughty little fly: You do not have permission to edit this!');
  }
});

//POST response to update/edit existing URLs
app.post('/urls/:id/update', (request, response) => {
  let updatedURL = request.params.id;
  urlDatabase[updatedURL] = {
    longURL: request.body.longURL,
    userID: request.cookies['user_id']
  };
  response.redirect('/urls');
});

//on POST response (from delete input), delete URL and refresh page
app.post('/urls/:id/delete', (request, response) => {
  if (request.cookies['user_id']) {
  let urlToDelete = request.params.id;
  delete urlDatabase[urlToDelete];
  response.redirect('/urls');
  } else {
    response.send('Wicked. Tricksy. False: This is not yours to delete!');
  }
});

app.get('/hello', (request, response) => {
  response.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





