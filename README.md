# Tamper Proof Data

At Bequest, we require that important user data is tamper-proof. Otherwise, our system can incorrectly distribute assets if our internal server or database is breached.

**1. How does the client ensure that their data has not been tampered with?**
**2. If the data has been tampered with, how can the client recover the lost data?**

Edit this repo to answer these two questions using any technologies you'd like, there are many possible solutions. Feel free to add comments.

### Solutions Implemented:

1. **Data Integrity Verification:**
   - The client fetches data and its corresponding hash from the server when the application loads.
   - On each update attempt, the client generates a hash of the current data and compares it with the original hash fetched from the server.
   - If the hashes match, it means the data has not been tampered with; otherwise, it indicates a tampering attempt.

2. **Automatic Data Recovery:**
   - The client continuously monitors the data input field.
   - If any tampering is detected (i.e., the hash of the current data does not match the original hash), the client automatically reverts the data to the last known good state fetched from the server.
   - This ensures that the data displayed on the client is always consistent with the server, preventing any unauthorized changes.

### To run the apps:
Run the following command in both the frontend and backend directories:
```sh
npm run start
```

### To make a submission:
1. Clone the repo
2. Make a PR with your changes in your repo
3. Email your GitHub repository to robert@bequest.finance

---

### Code Overview:

**Frontend (React):**
- Fetches data and its hash from the server and monitors the data input field.
- Uses `crypto-js` to generate SHA-256 hashes of the data.
- Uses `react-toastify` to display notifications about data integrity status.

**Backend (Express):**
- Provides endpoints to get and update data.
- Uses Node.js `crypto` module to generate and verify SHA-256 hashes of the data.

---

```jsx
// Frontend: src/App.tsx
import React, { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = "http://localhost:8080";

const App = () => {
  const [data, setData] = useState<string>("");
  const [originalHash, setOriginalHash] = useState<string>("");

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    const interval = setInterval(verifyData, 2000);
    return () => clearInterval(interval);
  }, [data, originalHash]);

  const getData = async () => {
    try {
      const response = await fetch(API_URL);
      const { data, hash } = await response.json();
      setData(data);
      setOriginalHash(hash); // Set original hash from server
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const generateHash = (data: string) => {
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  };

  const updateData = async () => {
    const newData = data;
    const hash = generateHash(newData);

    try {
      await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ data: newData, hash }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      await getData();
      toast.success("Data updated successfully!");
    } catch (error) {
      console.error("Failed to update data:", error);
      toast.error("Failed to update data.");
    }
  };

  const verifyData = async () => {
    try {
      const response = await fetch(API_URL);
      const { data: newData, hash } = await response.json();
      const currentHash = generateHash(data);

      if (originalHash === currentHash) {
        toast.info("Data has not been tampered with.");
      } else {
        toast.warn("Data has been tampered with!");
        setData(newData);
        setOriginalHash(hash);
      }
    } catch (error) {
      console.error("Failed to verify data:", error);
      toast.error("Failed to verify data.");
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        position: "absolute",
        padding: 0,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "20px",
        fontSize: "30px",
      }}
    >
      <div>Saved Data</div>
      <input
        style={{ fontSize: "30px" }}
        type="text"
        value={data}
        onChange={(e) => setData(e.target.value)}
      />

      <div style={{ display: "flex", gap: "10px" }}>
        <button style={{ fontSize: "20px" }} onClick={updateData}>
          Update Data
        </button>
      </div>

      <ToastContainer />
    </div>
  );
};

export default App;
```

```ts
// Backend: server/app.ts
import express from "express";
import cors from "cors";
import crypto from "crypto";

const PORT = 8080;
const app = express();
const database = { data: "Hello World", hash: "" };

// Generate initial hash
database.hash = crypto.createHash("sha256").update(database.data).digest("hex");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ data: database.data, hash: database.hash });
});

app.post("/", (req, res) => {
  const newData: string = req.body.data;
  const newHash: string = req.body.hash;

  // Verify integrity of data
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
```

---
