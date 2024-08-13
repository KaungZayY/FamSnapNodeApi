import qry from './database.js';
import http from 'http';
import url from 'url';
const PORT = process.env.PORT;

const middleWare = (req,res,next) => {
    //middle ware contents here
    next();
}

const getAlbums = async (res) =>{
    try 
    {
        const results = await qry('SELECT * FROM albums');
        res.statusCode = 200;
        res.end(JSON.stringify(results));
    } 
    catch (err) 
    {
        res.statusCode = 500;
        res.end(JSON.stringify({error: `${err}`}));
    }
}

const getAlbumById = async (req,res)=>{
    const id = req.url.split('/')[3];
    try 
    {
        const results = await qry('SELECT * FROM albums WHERE id=?',[id]);
        if (results.length > 0) {
            res.statusCode = 200;
            res.end(JSON.stringify(results));
        } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ message: 'Album Not Found' }));
        }
    } 
    catch (err) 
    {
        res.statusCode = 500;
        res.end(JSON.stringify({error: `${err}`}));
    }
}

const notFound = (res) => {
    res.statusCode = 404;
    res.end(JSON.stringify({error:'Not Found'}))
}

const server = http.createServer((req,res)=>{
    res.setHeader('Content-Type', 'application/json');

    middleWare(req,res,()=>{
        // GET: /api/albums
        if(req.url === '/api/albums' && req.method === 'GET')
        {
            getAlbums(res);
        }
        // GET: /api/albums/:id
        else if(req.url.match(/\/api\/albums\/([0-9]+)/) && req.method === 'GET'){
            getAlbumById(req,res);
        }
        else
        {
            notFound(res);
        }
    })
})

server.listen(PORT,()=>{
    console.log(`Server running on ${PORT}`)
});