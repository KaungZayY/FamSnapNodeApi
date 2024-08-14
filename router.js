import { getAlbums as getAlbumsV1, getAlbumById as getAlbumByIdV1, createAlbum as createAlbumV1, updateAlbum as updateAlbumV1, updateAlbumName as updateAlbumNameV1, deleteAlbum as deleteAlbumV1} from "./v1/albumHandler.js";
import { routeNotFound } from "./commonHandler.js";

const routeHandler = (req,res) => {

    const apiVersion = req.url.split('/')[2];
    
    // api v1
    if(apiVersion === 'v1'){
        // GET: /api/v1/albums
        if (req.url === '/api/v1/albums' && req.method === 'GET') {
            getAlbumsV1(res);
        }
        // POST: /api/v1/albums
        else if (req.url === '/api/v1/albums' && req.method === 'POST') {
            createAlbumV1(req, res);
        }
        // PUT: /api/v1/albums/:id @params: name, description
        else if (req.url.match(/\/api\/v1\/albums\/([0-9]+)/) && req.method === 'PUT') {
            updateAlbumV1(req, res);
        }
        // PATCH: /api/v1/albums/:id @params: name
        else if (req.url.match(/\/api\/v1\/albums\/([0-9]+)/) && req.method === 'PATCH') {
            updateAlbumNameV1(req, res);
        }
        // DELETE: /api/v1/albums/:id
        else if (req.url.match(/\/api\/v1\/albums\/([0-9]+)/) && req.method === 'DELETE') {
            deleteAlbumV1(req, res);
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