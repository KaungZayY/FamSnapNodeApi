import qry from './database.js';
import http from 'http';
import url from 'url';
const PORT = process.env.PORT;

const server = http.createServer(async(req,res)=>{
    res.setHeader('Content-Type', 'application/json');
    try
    {
        if(req.method === 'GET')
        {
            //get all albums
            if(req.url === '/albums')
            {
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
        }
    }
    catch(error)
    {
        res.statusCode = 500
        res.end(JSON.stringify({ error: `Server Error: ${error}` }));
    }
})

server.listen(PORT,()=>{
    console.log(`Server running on ${PORT}`)
});