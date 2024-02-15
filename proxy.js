const http = require('http');
const httpProxy = require('http-proxy');

// Create a proxy server instance
const proxy = httpProxy.createProxyServer({});

// Handle proxy requests
const server = http.createServer((req, res) => {
    // Remove literal spaces from the URL
    const before = req.url;
    const after = before.replace(/ /g, '');

    const target = 'http://hubtest.siteguard.online';
    console.log({ before, after, target });

    req.url = after;

    req.headers.host = 'hubtest.siteguard.online';



    // Proxy the request to the target server
    proxy.web(req, res, {
        target
    });
});

// Handle errors
proxy.on('error', (err, req, res) => {
    console.error(err);
    res.writeHead(500, {
        'Content-Type': 'text/plain',
    });
    res.end('Something went wrong.');
});

// Listen on a specific port
const PORT = 3002;
server.listen(PORT, () => {
    console.log(`Proxy server listening on port ${PORT}`);
});