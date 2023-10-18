// importing the dependencies
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import client from "./db.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

// defining the Express app
const app = express();

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan("combined"));

app.get("/", async (req, res) => {
  res.send("MKX POS API");
});

app.post("/test", async (req, res) => {
  // res.send("MKX POS API");
  const keys = [];
  const values = [];

  for (var i = 0; i < Object.keys(req.body).length; i++) {
    keys.push(Object.keys(req.body)[i].replace(/"/g, "'"));
  }

  for (var i = 0; i < Object.values(req.body).length; i++) {
    values.push(Object.values(req.body)[i].replace(/"/g, "'"));
  }

  await client.query(
    `INSERT INTO test (${keys[0]}, ${keys[1]}) VALUES(${values[0]}, ${values[1]})`
  );
});

app.post("/create-table", async (req, res) => {
  await client.query(
    `CREATE TABLE ${req.body.table}(id varchar(255),title varchar(255), PRIMARY KEY( id ))`
  );
});

// defining an endpoint to return all ads
app.get("/users", async (req, res) => {
  try {
    const { rows } = await client.query("SELECT * FROM  users");
    res.status(200).send(rows);
  } catch (e) {
    console.log(e);
  }
});

app.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      gender,
      date_of_birth,
      state,
      city,
      country,
      profile_url,
    } = req.body;
    if (Object.keys(req.body).length === 0) {
      res.status(400).send("Req body empty");
    }
    if (!(email && email.toLowerCase() && password && name)) {
      res.status(400).send("All input are required..!");
    }
    const id = uuidv4();
    const { rowCount: isUserExist } = await client.query(
      "select email from users where email=$1",
      [email.toLowerCase()]
    );

    if (isUserExist) {
      res.status(409).send({
        message: "This email is already registered..!",
      });
    } else {
      let encryptedPassword = await bcrypt.hash(password, 10);

      await client.query(
        "INSERT INTO users (id, name, email, password, gender, date_of_birth, state, city, country, profile_url) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
        [
          id,
          name,
          email.toLowerCase(),
          encryptedPassword,
          gender,
          date_of_birth,
          state,
          city,
          country,
          profile_url,
        ]
      );
      res.json("Congratulations, You are registered..!");
    }

    console.log(req.body);
  } catch (err) {
    console.log(err.message);
  }
});

app.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { rows } = await client.query(
      "SELECT * FROM  users WHERE  email=$1",
      [email.toLowerCase()]
    );

    if (
      rows.length !== 0 &&
      email.toLowerCase() === rows[0].email &&
      (await bcrypt.compare(password, rows[0].password))
    ) {
      delete rows[0].password;
      const token = jwt.sign(
        { id: rows[0].id, email: rows[0].email },
        "MANIKANT_APP_MKX"
      );
      rows[0].token = token;
      res.json(rows);
    } else
      res.status(400).send({
        message: "You've entered incorrect email or password..!",
      });
    console.log(rows);
  } catch (err) {
    console.log(err.message);
  }
});

app.listen(process.env.PORT || 8080, () => {
  console.log("listening on port 8080");
});
