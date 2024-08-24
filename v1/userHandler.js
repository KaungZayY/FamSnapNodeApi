import qry from '../database.js';
import bcrypt from 'bcrypt';

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