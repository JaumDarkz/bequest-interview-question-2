import express from "express";
import cors from "cors";
import crypto from "crypto";

const PORT = 8080;
const app = express();
const database = { data: "Hello World", hash: "" };

// Initialize the hash at startup
database.hash = crypto.createHash("sha256").update(database.data).digest("hex");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ data: database.data, hash: database.hash });
});

app.post("/", (req, res) => {
  const newData: string = req.body.data;
  const newHash: string = req.body.hash;

  if (verifyHash(newData, newHash)) {
    database.data = newData;
    database.hash = newHash;
    res.sendStatus(200);
  } else {
    res.status(400).send("Data tampered with. Operation aborted.");
  }
});

const generateHash = (data: string): string => {
  return crypto.createHash("sha256").update(data).digest("hex");
};

const verifyHash = (data: string, hash: string): boolean => {
  const calculatedHash = generateHash(data);
  return calculatedHash === hash;
};

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});