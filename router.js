import url from 'url';
import path from 'path';
import fs from 'fs';
import { getAlbums as getAlbumsV1, getAlbumById as getAlbumByIdV1, createAlbum as createAlbumV1, updateAlbum as updateAlbumV1, updateAlbumName as updateAlbumNameV1, deleteAlbum as deleteAlbumV1 } from "./v1/albumHandler.js";
import { createImage as createImageV1, imageUpload as imageUploadV1, getImages as getImagesV1, getImageById as getImageByIdV1, updateImage as updateImageV1, updateImagePatch as updateImagePatchV1, deleteImage as deleteImageV1 } from "./v1/imageHandler.js";
import { routeNotFound } from "./commonHandler.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const staticFileRoutes = (req, res) => {
    const parsedUrl = url.parse(req.url);
    const pathname = path.join(__dirname, 'public', parsedUrl.pathname);

    fs.stat(pathname, (err, stats) => {
        if (err || !stats.isFile()) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'File not found' }));
            return;
        }

        const ext = path.extname(pathname).toLowerCase();
        const mimeType = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif'
        };

        res.setHeader('Content-Type', mimeType[ext] || 'application/octet-stream');
        fs.createReadStream(pathname).pipe(res);
    });
}

const apiRoutes = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const [,, apiVersion, resource, id] = req.url.split('/');

    // api v1
    if (apiVersion === 'v1') {
        const method = req.method;

        switch (resource) {
            case 'albums':
                switch (method) {
                    case 'GET':
                        if (id) {
                            // GET: /api/v1/albums/:id
                            getAlbumByIdV1(req, res);
                        } else {
                            // GET: /api/v1/albums
                            getAlbumsV1(res);
                        }
                        break;
                    case 'POST':
                        // POST: /api/v1/albums @params: name, description
                        createAlbumV1(req, res);
                        break;
                    case 'PUT':
                        if (id) {
                            // PUT: /api/v1/albums/:id @params: name, description
                            updateAlbumV1(req, res);
                        } else {
                            routeNotFound(res);
                        }
                        break;
                    case 'PATCH':
                        if (id) {
                            // PATCH: /api/v1/albums/:id @params: name
                            updateAlbumNameV1(req, res);
                        } else {
                            routeNotFound(res);
                        }
                        break;
                    case 'DELETE':
                        if (id) {
                            // DELETE: /api/v1/albums/:id
                            deleteAlbumV1(req, res);
                        } else {
                            routeNotFound(res);
                        }
                        break;
                    default:
                        routeNotFound(res);
                        break;
                }
                break;

            case 'images':
                switch (method) {
                    case 'GET':
                        if (id) {
                            // GET: /api/v1/imagaes/:id
                            getImageByIdV1(req, res);
                        } else {
                            // GET: /api/v1/images
                            getImagesV1(res);
                        }
                        break;
                    case 'POST':
                        // POST: /api/v1/images @params: title, image, album_id
                        if (req.url === '/api/v1/images/upload') {
                            imageUploadV1(req, res);
                        } else {
                            // POST: /api/v1/images @params: form-data image
                            createImageV1(req, res);
                        }
                        break;
                    case 'PUT':
                        if (id) {
                            // PUT: /api/v1/images/:id @params: title, image, album_id
                            updateImageV1(req, res);
                        } else {
                            routeNotFound(res);
                        }
                        break;
                    case 'PATCH':
                        if (id) {
                            // PATCH: /api/v1/images/:id @params: title || image || album_id
                            updateImagePatchV1(req, res);
                        } else {
                            routeNotFound(res);
                        }
                        break;
                    case 'DELETE':
                        if (id) {
                            // DELETE: /api/v1/images/:id
                            deleteImageV1(req, res);
                        } else {
                            routeNotFound(res);
                        }
                        break;
                    default:
                        routeNotFound(res);
                        break;
                }
                break;

            default:
                routeNotFound(res);
                break;
        }
    } else {
        routeNotFound(res);
    }
};



const routeHandler = (req, res) => {
    if (req.url.startsWith('/images/')) {
        staticFileRoutes(req, res);
    } 
    else {
        apiRoutes(req, res);
    }
}

export default routeHandler;