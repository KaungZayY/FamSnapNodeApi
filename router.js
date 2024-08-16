import { getAlbums as getAlbumsV1, getAlbumById as getAlbumByIdV1, createAlbum as createAlbumV1, updateAlbum as updateAlbumV1, updateAlbumName as updateAlbumNameV1, deleteAlbum as deleteAlbumV1 } from "./v1/albumHandler.js";
import { createImage as createImageV1, imageUpload as imageUploadV1, getImages as getImagesV1, getImageById as getImageByIdV1, updateImage as updateImageV1, updateImagePatch as updateImagePatchV1, deleteImage as deleteImageV1 } from "./v1/imageHandler.js";
import { routeNotFound } from "./commonHandler.js";

const routeHandler = (req, res) => {

    const apiVersion = req.url.split('/')[2];

    // api v1
    if (apiVersion === 'v1') {
        // GET: /api/v1/albums
        if (req.url === '/api/v1/albums' && req.method === 'GET') {
            getAlbumsV1(res);
        }
        // GET: /api/v1/albums/:id
        else if (req.url.match(/\/api\/v1\/albums\/([0-9]+)/) && req.method === 'GET') {
            getAlbumByIdV1(req, res);
        }
        // POST: /api/v1/albums @params: name, description
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
        // GET: /api/v1/images
        else if (req.url === '/api/v1/images' && req.method === 'GET') {
            getImagesV1(res);
        }
        // POST: /api/v1/images @params: title, image, album_id
        else if (req.url === '/api/v1/images' && req.method === 'POST') {
            createImageV1(req, res);
        }
        // POST: /api/v1/images @params: form-data image
        else if (req.url === '/api/v1/images/upload' && req.method === 'POST') {
            imageUploadV1(req, res);
        }
        // GET: /api/v1/imagaes/:id
        else if (req.url.match(/\/api\/v1\/images\/([0-9]+)/) && req.method === 'GET') {
            getImageByIdV1(req, res);
        }
        // PUT: /api/v1/images/:id @params: title, image, album_id
        else if (req.url.match(/\/api\/v1\/images\/([0-9]+)/) && req.method === 'PUT') {
            updateImageV1(req, res);
        }
        // PATCH: /api/v1/images/:id @params: title || image || album_id
        else if (req.url.match(/\/api\/v1\/images\/([0-9]+)/) && req.method === 'PATCH') {
            updateImagePatchV1(req, res);
        }
        // DELETE: /api/v1/images/:id
        else if (req.url.match(/\/api\/v1\/images\/([0-9]+)/) && req.method === 'DELETE') {
            deleteImageV1(req, res);
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