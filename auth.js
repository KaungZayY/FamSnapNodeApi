import jwt from 'jsonwebtoken';

const access_token_secret = process.env.ACCESS_TOKEN_SECRET;

export const validateTokenMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Token not present' }));
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Token not present' }));
    }

    jwt.verify(token, access_token_secret, (err, user) => {
        if (err) {
            res.statusCode = 403;
            return res.end(JSON.stringify({ error: 'Token invalid' }));
        }

        req.user = user;

        next();
    });
};
