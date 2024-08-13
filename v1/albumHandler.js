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

