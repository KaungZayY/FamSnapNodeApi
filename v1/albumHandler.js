import qry from '../database.js'

export const getAlbums = async (res) => {
    try {
        const result = await qry('SELECT * FROM albums');
        res.statusCode = 200;
        res.end(JSON.stringify(result));
    }
    catch (err) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: `${err}` }));
    }
}

export const getAlbumById = async (req, res) => {
    const id = req.url.split('/')[4];
    try {
        const result = await qry('SELECT * FROM albums WHERE id=?', [id]);
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
        try {
            const { name, description } = JSON.parse(body);
            if (!name) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Album name is required!' }));
                return;
            }
            const result = await qry('INSERT INTO albums(name, description) VALUES (?,?)', [name, description]);
            const insertId = result.insertId;
            const newAlbum = await qry('SELECT * FROM albums WHERE id = ?', [insertId]);
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
    const id = req.url.split('/')[4];
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
        try {
            if (!name) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Album name is required!' }));
                return;
            }
            const result = await qry('UPDATE albums SET name = ?, description = ? WHERE id = ?', [name, description, id]);
            if (result.affectedRows > 0) {
                const album = await qry('SELECT * FROM albums WHERE id = ?', [id]);
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
            res.end(JSON.stringify({ error: `Server error: ${err}` }));
        }
    })
}

export const updateAlbumPatch = async (req, res) => {
    let body = '';
    const id = req.url.split('/')[4];
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        try {
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

            updateValues.push(id);

            const sqlQuery = `UPDATE albums SET ${updateFields.join(', ')} WHERE id = ?`;

            const result = await qry(sqlQuery, updateValues);

            if (result.affectedRows > 0) {
                const image = await qry('SELECT * FROM albums WHERE id = ?', [id]);
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
    const id = req.url.split('/')[4];
    try {
        const result = await qry('DELETE FROM albums WHERE id = ?', [id]);
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