import http from 'http';
import url from 'url';
import routeHandler from './router.js';
const PORT = process.env.PORT;

const middleWare = (req,res,next) => {
    //middle ware contents here
    next();
}

const server = http.createServer((req,res)=>{
    res.setHeader('Content-Type', 'application/json');

    middleWare(req, res, () => {
        routeHandler(req, res);
    });
})

server.listen(PORT,()=>{
    console.log(`Server running on ${PORT}`)
});