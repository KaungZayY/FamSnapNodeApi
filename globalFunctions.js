import qry from './database.js';

export const routeNotFound = (res) => {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not Found' }))
}

export const validateOwnership = async (table, unique_id, req, res) => {
    try {
        const result = await qry(`SELECT user_id FROM ?? WHERE unique_id = ?`, [table, unique_id]);

        if (result.length === 0) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: `${table} not found` }));
            return false;
        }

        const record = result[0];

        if (record.user_id !== req.user.userId) {
            res.statusCode = 403;
            res.end(JSON.stringify({ error: '403 forbidden' }));
            return false;
        }

        return true;
    } catch (error) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: `Server error: ${error.message}` }));
        return false;
    }
};

