export const routeNotFound = (res) => {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not Found' }))
}

export const generateId = (t) => {
    const timestamp = Date.now();

    const randomPart = Math.floor(Math.random() * 100000000);

    const formattedRandomPart = randomPart.toString().padStart(8, '0');

    const additionalDigit = Math.floor(Math.random() * 10);

    return `${t}-${additionalDigit}${formattedRandomPart}`;
};
