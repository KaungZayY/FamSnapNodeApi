import qry from './database.js';
import http from 'http';
import url from 'url';
const PORT = process.env.PORT;

const server = http.createServer(async(req,res)=>{
    
})

server.listen(PORT,()=>{
    console.log(`Server running on ${PORT}`)
});