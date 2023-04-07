const express = require("express");
const cookieParser = require('cookie-parser');
const { response } = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

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

console.log(generateRandomString()); // Example output: "G4t9Fj"

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//POST REQUESTS
app.post("/register", (request, response) => {
  const user_id = generateRandomString()
  const {email, password} = request.body
  users[user_id] = {
    id: user_id,
    email,
    password
  }
  console.log(users)
  response.cookie('user_id', user_id)
  response.redirect(`/urls`)
})

app.post("/urls", (request, response) => {
  console.log(request.body); // Log the POST request body to the console
  const key = generateRandomString();
  urlDatabase[key] = request.body.longURL;
  console.log(urlDatabase);
  response.redirect(`/urls/${key}`);
});

app.post("/urls/:id", (request, response) => {
  urlDatabase[request.params.id] = request.body.longURL
  response.redirect(`/urls`);
});

app.post("/urls/:id/delete", (request, response) => {
  delete urlDatabase[request.params.id];
  response.redirect(`/urls`);
});

app.post("/login", (request, response) => {
  const username = request.body.username
  response.cookie('user_id', username)
  response.redirect(`/urls`)
});

app.post("/logout", (request, response) => {
  response.clearCookie("user_id")
  response.redirect("/urls")
})

//GET REQUESTS
app.get("/register", (request, response) => {
  const templateVars = {  
    user: null}
  response.render("urls_registration", templateVars)
})


app.get("/u/:id", (request, response) => {
  const longURL = urlDatabase[request.params.id];
  response.redirect(longURL);
});

app.get("/urls", (request, response) => {
  const username = request.cookies["user_id"]
  const user = users[username]
  console.log(username)
  console.log(user)
  const templateVars = { 
    urls: urlDatabase , 
    user: user
  };
  response.render("urls_index", templateVars);
});

//Add a GET Route to Show the Form
app.get("/urls/new", (request, response) => {
  const templateVars = { 
    username: request.cookies["user_id"],
  };
  response.render("urls_new", templateVars);
});

app.get("/set", (request, response) => {
  const a = 1;
  response.send(`a = ${a}`);
});

app.get("/urls/:id", (request, response) => {
  const id = request.params.id;
  const templateVars = {
    id: request.params.id,
    longURL: urlDatabase[id],
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
