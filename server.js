import http from 'http';
import routeHandler from './router.js';
const PORT = process.env.PORT;


const server = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');

    routeHandler(req, res);
})

server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
});