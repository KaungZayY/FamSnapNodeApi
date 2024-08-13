import qry from '../database.js'

export const getAlbums = async (res) =>{
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

export const getAlbumById = async (req,res)=>{
    const id = req.url.split('/')[4];
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

export const createAlbum = async (req,res) =>{
    let body = '';
    req.on('data',(chunk)=>{
        body += chunk.toString();
    });
    req.on('end',async ()=>{
        try {
            const {name, description} = JSON.parse(body);
            if(!name){
                res.statusCode = 400;
                res.end(JSON.stringify({error: 'Album name is required!'}));
                return;
            }
            const result = await qry('INSERT INTO albums(name, description) VALUES (?,?)',[name, description]);
            const insertId = result.insertId;
            const newAlbum = await qry('SELECT * FROM albums WHERE id = ?', [insertId]);
            res.statusCode = 201;
            res.end(JSON.stringify(newAlbum[0]));
        } 
        catch (err) {
            res.statusCode = 400;
            res.end(JSON.stringify({error: `${err}`}));
        }
    })
}