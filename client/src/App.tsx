import React, { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:8080";

const App = () => {
  const [data, setData] = useState<string>("");
  const [originalHash, setOriginalHash] = useState<string>("");

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      verifyData();
    }, 1000);
    return () => clearInterval(interval);
  }, [data, originalHash]);

  const getData = async () => {
    try {
      const response = await fetch(API_URL);
      const { data, hash } = await response.json();
      setData(data);
      setOriginalHash(hash);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const generateHash = (data: string) => {
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  };

  const verifyData = async () => {
    try {
      const response = await fetch(API_URL);
      const { data: serverData, hash: serverHash } = await response.json();
      const currentHash = generateHash(data);

      if (currentHash !== serverHash) {
        toast.warn("Data has been tampered with! Reverting changes.");
        setData(serverData);
        setOriginalHash(serverHash);
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

      <ToastContainer />
    </div>
  );
};

export default App;