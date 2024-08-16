import fs from 'fs/promises';
import path from 'path';
import multiparty from 'multiparty';
import { fileURLToPath } from 'url';
import qry from '../database.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const imageUpload = async (req, res) => {

    const form = new multiparty.Form();
    const imageDir = path.join(__dirname, '../images');

    form.parse(req, async (err, fields, files) => {
        if (!err) {
            try {
                await fs.mkdir(imageDir, { recursive: true });
                const file = files.image[0];

                const destPath = path.join(imageDir, path.basename(file.originalFilename));

                await fs.copyFile(file.path, destPath);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ image: `/images/${path.basename(file.originalFilename)}` }));
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
        const { title, image, album_id } = JSON.parse(body);
        try {
            if(!title){
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Image title is required!' }));
                return;
            }

            if(!image){
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Image is required!' }));
                return;
            }

            if(!album_id){
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

const checkAlbumExists = async (album_id, res) =>{
    const result = await qry('SELECT id FROM albums WHERE id = ?', [album_id]);
    if (result.length === 0) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Album not found!' }));
        return;
    }
}