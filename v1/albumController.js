import qry from '../database.js'
import { validateOwnership } from '../globalFunctions.js';

export const getAlbums = async (res) => {
    try {
        const result = await qry('SELECT unique_id, name, description FROM albums');
        res.statusCode = 200;
        res.end(JSON.stringify(result));
    }
    catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: `${err}` }));
    }
}

export const getAlbumById = async (req, res) => {
    const unique_id = req.url.split('/')[4];
    try {
        const result = await qry('SELECT unique_id, name, description FROM albums WHERE unique_id=?', [unique_id]);
        if (result.length > 0) {
            res.statusCode = 200;
            res.end(JSON.stringify(result));
        } else {
            res.statusCode = 404;
            res.end(JSON.stringify({ message: 'Album Not Found' }));
        }
    }
    catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: `${err}` }));
    }
}

export const createAlbum = async (req, res) => {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        if (!body) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Request body is required!' }));
            return;
        }
        const { name, description } = JSON.parse(body);
        if (!name) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Album name is required!' }));
            return;
        }
        try {
            const userId = req.user.userId;
            const result = await qry('INSERT INTO albums(name, description, user_id) VALUES (?,?,?)', [name, description, userId]);
            const insertId = result.insertId;
            const formattedId = insertId.toString().padStart(7, '0');
            const uniqueId = `A-${formattedId}`;
            await qry('UPDATE albums SET unique_id = ? WHERE id = ?', [uniqueId, insertId]);
            const newAlbum = await qry('SELECT unique_id, name, description FROM albums WHERE id = ?', [insertId]);
            res.statusCode = 201;
            res.end(JSON.stringify(newAlbum[0]));
        }
        catch (err) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: `${err}` }));
        }
    })
}

export const updateAlbum = async (req, res) => {
    let body = '';
    const unique_id = req.url.split('/')[4];
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        if (!body) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Request body is required!' }));
            return;
        }
        const { name, description } = JSON.parse(body);
        if (!name) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Album name is required!' }));
            return;
        }

        const isOwner = await validateOwnership('albums', unique_id, req, res);
        if (!isOwner) {
            return;
        }

        try {
            
            const result = await qry('UPDATE albums SET name = ?, description = ? WHERE unique_id = ?', [name, description, unique_id]);
            if (result.affectedRows > 0) {
                const album = await qry('SELECT unique_id, name, description FROM albums WHERE unique_id = ?', [unique_id]);
                res.statusCode = 200;
                res.end(JSON.stringify(album[0]));
            }
            else {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Album not found' }));
            }
        }
        catch (error) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: `Server error: ${error}` }));
        }
    })
}

export const updateAlbumPatch = async (req, res) => {
    let body = '';
    const unique_id = req.url.split('/')[4];
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        const { name, description } = JSON.parse(body);

            if (!name && !description) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'At least one of name or description is required!' }));
                return;
            }

            const updateFields = [];
            const updateValues = [];

            if (name) {
                updateFields.push('name = ?');
                updateValues.push(name);
            }

            if (description) {
                updateFields.push('description = ?');
                updateValues.push(description);
            }
            updateValues.push(unique_id);

            const isOwner = await validateOwnership('albums', unique_id, req, res);
            if (!isOwner) {
                return;
            }

        try {
            
            const sqlQuery = `UPDATE albums SET ${updateFields.join(', ')} WHERE unique_id = ?`;

            const result = await qry(sqlQuery, updateValues);

            if (result.affectedRows > 0) {
                const image = await qry('SELECT unique_id, name, description FROM albums WHERE unique_id = ?', [unique_id]);
                res.statusCode = 200;
                res.end(JSON.stringify(image[0]));
            } else {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: 'Album not found' }));
            }
        }
        catch (error) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: `Server error: ${error}` }));
        }
    })
}

export const deleteAlbum = async (req, res) => {
    const unique_id = req.url.split('/')[4];
    const isOwner = await validateOwnership('albums', unique_id, req, res);
    if (!isOwner) {
        return;
    }
    
    try {
        const result = await qry('DELETE FROM albums WHERE unique_id = ?', [unique_id]);
        if (result.affectedRows > 0) {
            res.statusCode = 200;
            res.end(JSON.stringify({ message: 'Album Removed' }));
        }
        else {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Album not found' }));
        }
    }
    catch (error) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: `${err}` }));
    }
}