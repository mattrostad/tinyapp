const express = require("express");
const cookieSession = require("cookie-session");
const { response } = require("express");
const { getUserByEmail } = require("./helpers.js");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["abcbasmfa4321413neo42"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

function urlsForUser(id) {
  let usersUrls = {};
  for (let urlId in urlDatabase) {
    if (urlDatabase[urlId].userID === id) {
      usersUrls[urlId] = urlDatabase[urlId];
    }
  }
  return usersUrls;
}

function generateRandomString() {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

//POST REQUESTS
app.post("/register", (request, response) => {
  const user_id = generateRandomString();
  const { email, password } = request.body;
  if (!email || !password) {
    return response
      .status(400)
      .send("User Error. Must input valid email or password");
  } else if (getUserByEmail(email)) {
    return response.status(400).send("Email already registered");
  }
  users[user_id] = {
    id: user_id,
    email,
    password: bcrypt.hashSync(password, 10),
  };
  request.session.user_id = user_id;
  response.redirect(`/urls`);
});

app.post("/urls", (request, response) => {
  const username = request.session.user_id;
  if (!username) {
    return response.send("Please register and sign in to shorten URLs");
  }
  const key = generateRandomString();
  urlDatabase[key] = { userID: username, longURL: request.body.longURL };
  response.redirect(`/urls/${key}`);
});

app.post("/urls/:id", (request, response) => {
  const id = request.params.id;
  const username = request.session.user_id;
  if (username === undefined) {
    response.send("Please Login");
    return;
  }
  if (!urlDatabase[id]) {
    response.send("This URL does not exist");
    return;
  }
  if (urlDatabase[id].userID !== username) {
    response.send("This URL does not belong to you");
    return;
  }
  urlDatabase[request.params.id].longURL = request.body.longURL;
  response.redirect(`/urls`);
});

//Endpoint to allow user's to delete URLs
app.post("/urls/:id/delete", (request, response) => {
  const id = request.params.id;
  const username = request.session.user_id;
  if (username === undefined) {
    response.send("Please Login");
    return;
  }
  if (!urlDatabase[id]) {
    response.send("This URL does not exist");
    return;
  }
  if (urlDatabase[id].userID !== username) {
    response.send("This URL does not belong to you");
    return;
  }
  delete urlDatabase[request.params.id];
  response.redirect(`/urls`);
});

//Endpoint to allow user login using email and password
app.post("/login", (request, response) => {
  const email = request.body.email;
  const password = request.body.password;
  const user = getUserByEmail(email, users);
  if (!user) {
    return response.status(403).send("Email not found");
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return response.status(403).send("Password does not match.");
  }
  request.session.user_id = user.id;
  response.redirect(`/urls`);
});

//Endpoint to allow user to logout and sends to login page
app.post("/logout", (request, response) => {
  request.session.user_id = null;
  response.redirect("/login");
});

//GET REQUESTS
app.get("/login", (request, response) => {
  const username = request.session.user_id;
  if (!username) {
    const templateVars = {
      urls: urlDatabase,
      user: username,
    };
    return response.render("urls_login", templateVars);
  }
  response.redirect("/urls");
});

//Endpoint to allow user to register
app.get("/register", (request, response) => {
  const username = request.session.user_id;
  if (!username) {
    const templateVars = {
      //urls: urlDatabase,
      user: null,
    };
    return response.render("urls_registration", templateVars);
  }
  response.redirect("/urls");
});

app.get("/u/:id", (request, response) => {
  const longURL = urlDatabase[request.params.id].longURL;
  response.redirect(longURL);
});

app.get("/urls", (request, response) => {
  const username = request.session.user_id;
  if (username === undefined) {
    return response.send("Please Login");
  }
  const user = users[username];
  const templateVars = {
    urls: urlsForUser(username),
    user: user,
  };
  response.render("urls_index", templateVars);
});

//Add a GET Route to Show the Form
app.get("/urls/new", (request, response) => {
  const username = request.session.user_id;
  if (!username) {
    return response.redirect("/login");
  }
  const user = users[username];
  const templateVars = {
    user: user,
  };
  response.render("urls_new", templateVars);
});

app.get("/set", (request, response) => {
  const a = 1;
  response.send(`a = ${a}`);
});

app.get("/urls/:id", (request, response) => {
  const id = request.params.id;
  const username = request.session.user_id;
  if (username === undefined) {
    response.send("Please Login");
    return;
  }
  if (!urlDatabase[id]) {
    response.send("This URL does not exist");
    return;
  }
  if (urlDatabase[id].userID !== username) {
    response.send("This URL does not belong to you");
    return;
  }
  const user = users[username];

  const templateVars = {
    id: request.params.id,
    longURL: urlDatabase[id].longURL,
    user: user,
  };
  response.render("urls_show", templateVars);
});

app.get("/fetch", (request, response) => {
  response.send(`a = ${a}`);
});

app.get("/hello", (request, response) => {
  response.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (request, response) => {
  response.send("Hello!");
});

app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
