import { getAlbums as getAlbumsV1, getAlbumById as getAlbumByIdV1 } from "./v1/albumHandler.js";
import { routeNotFound } from "./commonHandler.js";

const routeHandler = (req,res) => {

    const apiVersion = req.url.split('/')[2];
    
    // api v1
    if(apiVersion === 'v1'){
        // GET: /api/v1/albums
        if (req.url === '/api/v1/albums' && req.method === 'GET') {
            getAlbumsV1(res);
        }
        // GET: /api/v1/albums/:id
        else if (req.url.match(/\/api\/v1\/albums\/([0-9]+)/) && req.method === 'GET') {
            getAlbumByIdV1(req, res);
        }
        else {
            routeNotFound(res);
        }
    }
    else {
        routeNotFound(res);
    }
}

export default routeHandler;