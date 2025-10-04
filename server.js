const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');  
const exjwt = require('express-jwt');
const path = require('path');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

const PORT = 3000;
const secretKey = 'my super secret key';  
const jwtMW = exjwt({
    secret: secretKey,
    algorithms: ['HS256']
});

let users = [
    { id: 1, username: 'fabio', password: '123' },
    { id: 2, username: 'nolasco', password: '456' }
];  

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (user && user.password !== password) {
        return res.status(401).json({
            success: false,
            err: 'Incorrect password',
            token: null
        });
    }
    if (!user) {
        return res.status(401).json({
            success: false,
            err: 'User not found',
            token: null
        });
    }

    // Assignment #4 In the NodeJS, change the JWT expire to 3 minutes
    const token = jwt.sign(
        { id: user.id, username: user.username },
        secretKey,
        { expiresIn: '3m' }   
    );

    return res.json({
        success: true,
        err: null,
        token
    });
});

app.get('/api/dashboard', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'Secret content that only logged in people can see'
    });
});

app.get('/api/prices', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'this is the price $3.99'
    });
});

// Assignment #1 Create 1 more route (called settings) and protect this route with the JWT solution
app.get('/api/settings', jwtMW, (req, res) => {
    res.json({
        success: true,
        myContent: 'This is your settings page. Only logged in users can see this!'
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.status(401).json({ 
            success: false, 
            officialError: err,
            err: 'Username or password is incorrect 2' 
        });
    } else {
        next(err);
    }
}); 

app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});
