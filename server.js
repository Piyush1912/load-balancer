const express= require('express');
const os= require('os');

const app = express();
const port = 8080;

app.get('/',(req,res)=>{
    const serverName = os.hostname();
    const environment = process.env.environment || "Unknown Environment";

    res.send(`
            <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
                <h1>Hello from the Load Balanced App!</h1>
                <h2>You are talking to Server ID: <span style="color: blue;">${serverName}</span></h2>
                <p><strong>Current Environment:</strong> ${environment}</p>
            </div>
        `);
});

app.listen(port,() =>{
    console.log(`Test app is listening on port ${port}`);
});