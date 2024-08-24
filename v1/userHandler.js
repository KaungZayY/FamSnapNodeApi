import qry from '../database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

const { sign, verify } = jwt;
const access_token_secret = process.env.ACCESS_TOKEN_SECRET;
const refresh_token_secret = process.env.REFRESH_TOKEN_SECRET;

let refreshTokens = []

export const registerUser = async (req, res) => {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk.toString();
    })
    req.on('end', async () => {
        if (!body){
            res.statusCode = 400;
            res.end(JSON.stringify({error:'Request body is required!'}));
            return;
        }

        const {name, email, password, address} = JSON.parse(body);
        try{
            if (!name) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'User name is required!' }));
                return;
            }
            if (!email){
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Email is required!' }));
                return;
            }
            if (!password){
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Set password!' }));
                return;
            }
            if (!address){
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Address is required!' }));
                return;
            }

            validateEmail(email, res);
            checkEmailAlreadyExists(email, res);

            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await qry('INSERT INTO users(name, email, password, address) VALUES (?,?,?,?)', [name, email, hashedPassword, address]);
            
            if (result.affectedRows > 0) {
                res.statusCode = 201;
                res.end(JSON.stringify({message: 'User registered successfully'}));
            }
            else{
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Failed to register user' }));
            }
        } catch (error) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: `${error}` }));
        }
    })
}

export const login = async (req, res) => {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk.toString();
    })
    req.on('end', async () => {
        if (!body){
            res.statusCode = 400;
            res.end(JSON.stringify({error:'Request body is required!'}));
            return;
        }

        const {email, password} = JSON.parse(body);
        try {
            if (!email){
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Email is required!' }));
                return;
            }
            if (!password){
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Type password!' }));
                return;
            }

            const user = await findUser(email);
            if (!user){
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'User not found' }));
            }

            if (await bcrypt.compare(password, user.password)) {
                const accessToken = generateAccessToken({user})
                const refreshToken = generateRefreshToken({user})
                refreshTokens.push(refreshToken);
                res.statusCode = 200;
                res.end(JSON.stringify({accessToken, refreshToken}));
            } 
            else {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Incorrect password!' }));
            }
        } 
        catch (error) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: `${error}` }));
        }
    });
}

export const tokenRefresh = async (req, res) => {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk.toString();
    })
    req.on('end', async () => {
        if (!body){
            res.statusCode = 400;
            res.end(JSON.stringify({error:'Refresh Token is required!'}));
            return;
        }
        const {token} = JSON.parse(body);
        try {
            if (!token){
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Refresh Token is required!' }));
                return;
            }

            if (!refreshTokens.includes(token)){
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Invalid Refresh Token!' }));
                return;
            }
            const user = jwt.verify(token, refresh_token_secret);
            refreshTokens = refreshTokens.filter( (c) => c != token)
            const accessToken = generateAccessToken({user})
            const refreshToken = generateRefreshToken({user})
            refreshTokens.push(refreshToken);
            res.statusCode = 200;
            res.end(JSON.stringify({accessToken, refreshToken}));
        }
        catch (error) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: `${error}` }));
        }
    });
}

export const logout = (req, res) => {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', () => {
        if (!body) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Refresh Token is required!' }));
            return;
        }

        const { token } = JSON.parse(body);

        if (!token || !refreshTokens.includes(token)) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid or missing Refresh Token!' }));
            return;
        }

        refreshTokens = refreshTokens.filter((c) => c !== token);

        res.statusCode = 200;
        res.end(JSON.stringify({ message: 'Successfully logged out' }));
    });
};

const validateEmail = (email, res) => {
    var expression = /\S+@\S+\.\S+/;
    
    if(expression.test(email)){
        return;
    }
    else{
        res.statusCode = 400;
        res.end(JSON.stringify({error: 'Enter a valid email address!'}))
    }
    return;
}

const checkEmailAlreadyExists = async (email, res) => {
    const result = await qry('SELECT email FROM users WHERE email = ?', [email]);
    if (result.length > 0) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Email already exists!' }));
        return;
    }
}

const findUser = async (email) => {
    const result = await qry('SELECT * FROM users WHERE email = ?', [email]);
    return result[0];
}

const generateAccessToken = ({user}) => {
    return jwt.sign({userId:user.id}, access_token_secret, {expiresIn: '20m'});
}

const generateRefreshToken = ({user}) => {
    return jwt.sign({userId:user.id}, refresh_token_secret, {expiresIn: '30m'});
}