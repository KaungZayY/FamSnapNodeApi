import url from 'url';
import path from 'path';
import fs from 'fs';
import { getAlbums as getAlbumsV1, getAlbumById as getAlbumByIdV1, createAlbum as createAlbumV1, updateAlbum as updateAlbumV1, updateAlbumPatch as updateAlbumPatchV1, deleteAlbum as deleteAlbumV1 } from "./v1/albumController.js";
import { createImage as createImageV1, imageUpload as imageUploadV1, getImages as getImagesV1, getImageById as getImageByIdV1, updateImage as updateImageV1, updateImagePatch as updateImagePatchV1, deleteImage as deleteImageV1 } from "./v1/imageController.js";
import { registerUser as registerUserV1, login as loginV1, tokenRefresh as tokenRefreshV1, logout as logoutV1 } from './v1/userController.js';
import { routeNotFound } from "./globalFunctions.js";
import { validateTokenMiddleware as validateTokeenMiddlewareV1 } from './auth.js';

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

const authRoutes = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const [, authPrefix, apiVersion, action] = req.url.split('/');

    if (authPrefix === 'auth' && apiVersion === 'v1') {
        const method = req.method;

        switch (action) {
            case 'register':
                if (method === 'POST') {
                    // POST: /auth/v1/register @params: name, email, password, address
                    registerUserV1(req, res);
                } else {
                    routeNotFound(res);
                }
                break;
            case 'login':
                if (method === 'POST') {
                    // POST: /auth/v1/login @params: email, password
                    loginV1(req, res);
                } else {
                    routeNotFound(res);
                }
                break;
            case 'refresh':
                if (method === 'POST') {
                    // POST: /auth/v1/refresh @params: token
                    tokenRefreshV1(req, res);
                } else {
                    routeNotFound(res);
                }
                break;
            case 'logout':
                if (method === 'DELETE') {
                    // DELETE: /auth/v1/logout @params: token
                    logoutV1(req, res);
                } else {
                    routeNotFound(res);
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

const apiRoutes = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const [, , apiVersion, resource, id] = req.url.split('/');

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
                        validateTokeenMiddlewareV1(req, res, () => {
                            createAlbumV1(req, res);
                        });
                        break;
                    case 'PUT':
                        if (id) {
                            // PUT: /api/v1/albums/:id @params: name, description
                            validateTokeenMiddlewareV1(req, res, () => {
                                updateAlbumV1(req, res);
                            });
                        } else {
                            routeNotFound(res);
                        }
                        break;
                    case 'PATCH':
                        if (id) {
                            // PATCH: /api/v1/albums/:id @params: name
                            validateTokeenMiddlewareV1(req, res, () => {
                                updateAlbumPatchV1(req, res);
                            });
                        } else {
                            routeNotFound(res);
                        }
                        break;
                    case 'DELETE':
                        if (id) {
                            // DELETE: /api/v1/albums/:id
                            validateTokeenMiddlewareV1(req, res, () => { 
                                deleteAlbumV1(req, res);
                            });
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
                            validateTokeenMiddlewareV1(req, res, () => { 
                                imageUploadV1(req, res);
                            });
                        } else if (req.url === '/api/v1/images') {
                            // POST: /api/v1/images @params: form-data image
                            validateTokeenMiddlewareV1(req, res, () => { 
                                createImageV1(req, res);
                            });
                        } else {
                            routeNotFound(res);
                        }
                        break;
                    case 'PUT':
                        if (id) {
                            // PUT: /api/v1/images/:id @params: title, image, album_id
                            validateTokeenMiddlewareV1(req, res, () => { 
                                updateImageV1(req, res);
                            });
                        } else {
                            routeNotFound(res);
                        }
                        break;
                    case 'PATCH':
                        if (id) {
                            // PATCH: /api/v1/images/:id @params: title || image || album_id
                            validateTokeenMiddlewareV1(req, res, () => { 
                                updateImagePatchV1(req, res);
                            });
                        } else {
                            routeNotFound(res);
                        }
                        break;
                    case 'DELETE':
                        if (id) {
                            // DELETE: /api/v1/images/:id
                            validateTokeenMiddlewareV1(req, res, () => { 
                                deleteImageV1(req, res);
                            });
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
    else if (req.url.startsWith('/auth/v1')) {
        authRoutes(req, res);
    } 
    else if (req.url.startsWith('/api/v1')) {
        apiRoutes(req, res);
    } 
    else {
        routeNotFound(res);
    }
}

export default routeHandler;