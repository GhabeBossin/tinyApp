
//  ~~~~~~~~TinyApp by Ghabe Bossin~~~~~~~ //

// v---- DEPENDENCIES ----v

// default port 8080
const PORT = 8080;
//added randomString npm package for key generation found here: https://www.npmjs.com/package/randomstring
const randomString = require('randomstring');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['One', 'Ring']
}));
app.use(bodyParser.urlencoded({extended: true}));



// v---- DATABASES ----v


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

// v---- FUNCTIONS ----v


//generates random 6 character alphanumberic string
function genRandomString(num) {
  const ranString = randomString.generate(num);
  return ranString;
}

//validate login email and password
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

//filters URLs to only show for their user
function urlsForUser(userID) {
  userURLs = {};
  for (let key in urlDatabase) {
    if (userID === urlDatabase[key].userID) {
      userURLs[key] = urlDatabase[key];
    }
  }
  return userURLs;
}

// v~~~~~~~ ALL GET/POSTs ~~~~~~~~v
// - all app.get redirect based on login status except the shortURL redirect.


// v---- [/](landing) AND JSON ----v


app.get('/', (request, response) => {
  if (request.session.user_id) {
    response.redirect('/urls');
  } else {
    response.redirect('/login');
  }
});

app.get('/urls.json', (request, response) => {
  response.json(urlDatabase);
});

// v---- REGISTRATION ----v


app.get('/register', (request, response) => {
  if (!request.session.user_id) {
    response.render('urls_register', { user_id: false });
  }
  if (request.session.user_id) {
    response.redirect('/urls');
  }
});

//on POST from /register, stores email and password inputs, and generates + sets cookie id
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
      request.session.user_id = genID;
      response.redirect('/urls');
    }
  } else {
    response.status(400);
    response.send('You shall not pass!: You must <a href="/register">enter both a valid email and password</a> to register.');
  }
});

// v---- LOGIN/OUT ----v


app.get('/login', (request, response) => {
  if (!request.session.user_id) {
    response.render('urls_login', { user_id: false });
  }
  if (request.session.user_id) {
    response.redirect('/urls');
  }
});

//on POST from _header form login, creates cookie storing user_id input
app.post('/login', (request, response) => {
  const { email, password } = request.body;
  const currentUser = getCurrentUser(email, password);
  if (!currentUser) {
    response.status(403);
    response.send('Speak "friend", and enter: You must enter the <a href="/login">correct email and password</a> to proceed.');
  }
  request.session.user_id = currentUser.id;
  response.redirect('/urls');
});

//on POST from _header form logout, clearCookies and logout
app.post('/logout', (request, response) => {
  request.session = null;
  response.redirect('/urls');
});

// v---- URLS ----v


//possible refactoring example
app.get('/urls', (request, response) => {
  if (request.session.user_id) {
    let user_id = request.session.user_id;
    let templateVars = {
      urls: urlsForUser(user_id),
      user_id: request.session.user_id,
      email: userData[user_id].email
    };
    response.render('urls_index', templateVars);
  }
  if (!request.session.user_id) {
    response.send('Keep it secret... keep it safe: You must <a href="/register">register</a> or be <a href="/login">logged in</a> to view your URLs.');
  }
});

//on POST generates new key and adds it to urlDatabase, then redirects based on key
app.post('/urls', (request, response) => {
  let newKey = genRandomString(6);
  //ternary conditional template literal to fix inputs that do not have "http://"
  let longURL = request.body.longURL.includes('http') ? request.body.longURL : `http://${request.body.longURL}`;

  urlDatabase[newKey] = {
    longURL: longURL,
    userID: request.session.user_id
  };
  response.redirect(`/urls/${newKey}`);
});

// v- URLS/new -v

//creation page for short URLs
app.get('/urls/new',(request, response) => {
  if (request.session.user_id) {
    let templateVars = {
      user_id: request.session.user_id,
      email: userData[request.session.user_id].email
    };
    response.render('urls_new', templateVars);
  }
  if (!request.session.user_id) {
    response.send('There lies our hope, if hope it be: You must be logged in to shorten a new URL! Please <a href="/login">login</a> or <a href="/register">register.</a>');
  }
});

// v- URLS/id -v

app.get('/urls/:id', (request, response) => {
  if (request.session.user_id){
    let templateVars = {
      shortURL: request.params.id,
      longURL: urlDatabase[request.params.id].longURL,
      user_id: request.session.user_id,
      email: userData[request.session.user_id].email
    };
    response.render('urls_show', templateVars);
  }
  if (!request.session.user_id) {
    response.send('Naughty little fly: You do not have permission to edit this!');
  }
});

//POST response to update/edit existing URLs
app.post('/urls/:id/update', (request, response) => {
  let updatedURL = request.params.id;
  urlDatabase[updatedURL] = {
    longURL: request.body.longURL,
    userID: request.session.user_id,
  };
  response.redirect('/urls');
});

//on POST response (from delete input), delete URL and refresh page
app.post('/urls/:id/delete', (request, response) => {
  if (request.session.user_id) {
  let urlToDelete = request.params.id;
  delete urlDatabase[urlToDelete];
  response.redirect('/urls');
  } else {
    response.send('Wicked. Tricksy. False: This is not yours to delete!');
  }
});

// v---- U/:shortURL ----v


//redirects from shortURL to longURL
app.get('/u/:shortURL', (request, response) => {
  if (!urlDatabase.hasOwnProperty(request.params.shortURL)) {
    response.send('For even the very wise cannot see all ends: We have no record of this shortened URL');
  } else {
    let longURL = urlDatabase[request.params.shortURL].longURL;
    response.redirect(longURL);
  }
});

// v---- PORT  ----v


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


