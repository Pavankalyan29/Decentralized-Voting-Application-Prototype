require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const { ethers } = require('ethers');

const app = express();
const port = 3000;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.static(__dirname));
app.use(express.json());
app.use(fileUpload({ extended: true }));

// Environment variables
const API_URL = process.env.API_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// Load contract ABI
const { abi } = require('./artifacts/contracts/Voting.sol/Voting.json');

// Setup provider, wallet and contract instance
const provider = new ethers.providers.JsonRpcProvider(API_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

// Routes
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/index.html", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/addCandidate", async (req, res) => {
    const vote = req.body.vote;
    console.log("Vote index received:", vote);

    try {
        const isVotingOpen = await contractInstance.getVotingStatus();
        if (!isVotingOpen) {
            return res.status(400).send("Voting is finished");
        }

        console.log("Adding the candidate in voting contract...");
        const tx = await contractInstance.addCandidate(vote);
        await tx.wait();
        res.send("The candidate has been registered in the smart contract");
    } catch (error) {
        console.error("Error adding candidate:", error);
        res.status(500).send("Error adding candidate to blockchain");
    }
});

// Start server
app.listen(port, () => {
    console.log("App is listening on http://localhost:3000");
});