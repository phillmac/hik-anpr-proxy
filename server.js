// server.js

const net = require('net');
const { URL } = require('url'); // Import the URL module
const HTTPParser = require('./httpParser');
const http = require('http');


const UPSTREAM_SERVER_HOST = 'hubtest.siteguard.online';
const UPSTREAM_SERVER_PORT = 80


const server = net.createServer();

// Handle client connection
server.on('connection', (socket) => {
  console.log('New client connected.');

  const parser = new HTTPParser();

  let method, httpVersion, urlObject, queryParams;

  let body = Buffer.alloc(0);

  const headers = new Headers();

  // Handle incoming data for each client
  socket.on('data', (data) => {
    parser.parse(data.toString());
  });

  // Handle parsed headers
  parser.on('headers', (receivedHeaders) => {
    // Process headers for this client
    // console.log('Received headers:', receivedHeaders);

    const headersList = receivedHeaders.split('\r\n');

    const requestLine = headersList.shift(); // Assuming the first line is the request line

    for (const h of headersList) {
      headers.append(... h.split(':'));
    }

    headers.delete('host');
    headers.delete('content-length');

    // Extract and parse query parameters from the request URL
    const [m, ...urlParts] = requestLine.split(' ');

    method = m;

    if (urlParts.length > 0) {
      // Remove the httpVersion before joining
      httpVersion = urlParts.pop();

      // Join URL parts with an encoded space
      // const url = urlParts.map(encodeURIComponent).join('%20');
      const url = urlParts.join('%20');

      urlObject = new URL(url, `http://${UPSTREAM_SERVER_HOST}:${UPSTREAM_SERVER_PORT}`);

      console.log(JSON.stringify({ method, httpVersion, path: urlObject.pathname, headersList, urlParts, search: urlObject.search}));

    }
  });

  // Handle body data
  parser.on('data', (d) => {
    body = Buffer.concat([body, d]);
  });

  // Handle socket closure
  socket.on('end', () => {
    if(socket.writable) {
      socket.write(`${httpVersion} 200 OK\r\n\r\n"OK"\r\n`);
    }

    console.log('Client disconnected.');

     if(method?.toLowerCase() === 'post') {
      fetch(urlObject, {
        method,
        headers,
        body
      })
        .then((result) => console.log(result.ok))
        .catch(err => console.error(err));
     }
  });
});


// Listen on port 3002
const PORT = 3002;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
