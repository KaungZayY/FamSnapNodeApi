import fs from 'fs/promises';
import path from 'path';
import multiparty from 'multiparty';
import { fileURLToPath } from 'url';
import qry from '../database.js'
import { v4 as uuidv4 } from 'uuid';
import cloudinary from '../cloudinaryConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const imageUpload = async (req, res) => {

    const form = new multiparty.Form();
    const imageDir = path.join(__dirname, '../public/images');

    form.parse(req, async (err, fields, files) => {
        if (!err) {
            try {
                await fs.mkdir(imageDir, { recursive: true });
                const file = files.image[0];
                const fileType = file.headers['content-type'];
                const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

                if (!allowedTypes.includes(fileType)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Only JPG, PNG, or GIF files are allowed!' }));
                }

                const originalFileName = path.basename(file.originalFilename).replace(/\s+/g, '-'); // Replace spaces with hyphens
                const fileExtension = path.extname(originalFileName); // Get the file extension
                const uniqueName = `${uuidv4()}-${Date.now()}${fileExtension}`;

                // save under public folder

                const destPath = path.join(imageDir, uniqueName);
                await fs.copyFile(file.path, destPath);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ image: `/images/${uniqueName}` }));


                // save to cloudinary
                /*
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'fam_snap_images',
                    public_id: uniqueName,
                });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ image: result.secure_url }));
                */

            } catch (error) {
                return res.end(JSON.stringify({ error: 'File saving failed' }));
            }
        }
        else {
            return res.end(JSON.stringify({ error: 'File upload failed' }));
        }
        return;
    })
}

export const createImage = async (req, res) => {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk.toString();
    })
    req.on('end', async () => {
        if (!body) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Request body is required!' }));
            return;
        }
        const { title, image, album_id } = JSON.parse(body);
        try {
            if (!title) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Image title is required!' }));
                return;
            }

            if (!image) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Image is required!' }));
                return;
            }

            if (!album_id) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Album ID is required!' }));
                return;
            }

            checkAlbumExists(album_id, res)
            const result = await qry('INSERT INTO images(title, image, album_id) VALUES (?,?,?)', [title, image, album_id]);
            const insertId = result.insertId;
            const newAlbum = await qry('SELECT * FROM images WHERE id = ?', [insertId]);
            res.statusCode = 201;
            res.end(JSON.stringify(newAlbum[0]));

        } catch (error) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: `${error}` }));
        }
    })
}

export const getImages = async (res) => {
    try {
        const result = await qry('SELECT * FROM images');
        res.statusCode = 200;
        res.end(JSON.stringify(result));
    } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: `${error}` }));
    }
}

export const getImageById = async (req, res) => {
    const id = req.url.split('/')[4];
    try {
        const result = await qry('SELECT * FROM images WHERE id=?', [id]);
        if (result.length > 0) {
            res.statusCode = 200;
            res.end(JSON.stringify(result));
        } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ message: 'Image Not Found' }));
        }
    }
    catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: `${error}` }));
    }
}

export const updateImage = async (req, res) => {
    let body = '';
    const id = req.url.split('/')[4];
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async (chunk) => {
        if (!body) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Request body is required!' }));
            return;
        }
        const { title, image, album_id } = JSON.parse(body);
        try {
            if (!title) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Image title is required!' }));
                return;
            }

            if (!image) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Image is required!' }));
                return;
            }

            if (!album_id) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Album ID is required!' }));
                return;
            }

            checkAlbumExists(album_id, res);
            const result = await qry('UPDATE images SET title = ?, image = ?, album_id = ? WHERE id = ?', [title, image, album_id, id]);
            if (result.affectedRows > 0) {
                const image = await qry('SELECT * FROM images WHERE id = ?', [id]);
                res.statusCode = 200;
                res.end(JSON.stringify(image[0]));
            }
            else {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Image not found' }));
            }

        } catch (error) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: `Server error: ${error}` }));
        }
    })
}

export const updateImagePatch = async (req, res) => {
    let body = '';
    const id = req.url.split('/')[4];

    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const { title, image, album_id } = JSON.parse(body);

            if (!title && !image && !album_id) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'At least one of title, image or album id is required!' }));
                return;
            }

            const updateFields = [];
            const updateValues = [];

            if (title) {
                updateFields.push('title = ?');
                updateValues.push(title);
            }

            if (image) {
                updateFields.push('image = ?');
                updateValues.push(image);
            }

            if (album_id) {
                checkAlbumExists(album_id, res);
                updateFields.push('album_id = ?');
                updateValues.push(album_id);
            }

            // Adding the album ID at the end of the parameters
            updateValues.push(id);

            const sqlQuery = `UPDATE images SET ${updateFields.join(', ')} WHERE id = ?`;

            const result = await qry(sqlQuery, updateValues);

            if (result.affectedRows > 0) {
                const image = await qry('SELECT * FROM images WHERE id = ?', [id]);
                res.statusCode = 200;
                res.end(JSON.stringify(image[0]));
            } else {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Image not found' }));
            }
        } catch (error) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: `Server error: ${error.message}` }));
        }
    });
};

export const deleteImage = async (req, res) => {
    const id = req.url.split('/')[4];
    try {
        const result = await qry('DELETE FROM images WHERE id = ?', [id]);
        if (result.affectedRows > 0) {
            res.statusCode = 200;
            res.end(JSON.stringify({ message: 'Image Removed' }));
        }
        else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Image not found' }));
        }
    }
    catch (error) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: `${error}` }));
    }
}

const checkAlbumExists = async (album_id, res) => {
    const result = await qry('SELECT id FROM albums WHERE id = ?', [album_id]);
    if (result.length === 0) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Album not found!' }));
        return;
    }
}