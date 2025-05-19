const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    try {
        // Handle POST request
        if (req.method === 'POST' && req.url === '/submit') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', () => {
                try {
                    const parsed = new URLSearchParams(body);
                    const name = parsed.get('name');
                    const email = parsed.get('email');
                    const message = parsed.get('message');

                    const entry = `Name: ${name}\nEmail: ${email}\nMessage: ${message}\n---\n`;

                    fs.appendFile('contacts.txt', entry, err => {
                        if (err) {
                            console.error('Error saving contact:', err);
                            res.writeHead(500);
                            res.end('Server Error');
                        } else {
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.end(`<h1>Thank you, ${name}!</h1><p>Your message has been received.</p>`);
                        }
                    });
                } catch (e) {
                    console.error('Error processing POST data:', e);
                    res.writeHead(500);
                    res.end('Server Error');
                }
            });

            return;
        }

        // Serve static files from current directory
        let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
        const extname = path.extname(filePath);

        let contentType = 'text/html';
        switch (extname) {
            case '.js': contentType = 'text/javascript'; break;
            case '.css': contentType = 'text/css'; break;
            case '.png': contentType = 'image/png'; break;
            case '.jpg':
            case '.jpeg': contentType = 'image/jpeg'; break;
            case '.svg': contentType = 'image/svg+xml'; break;
            case '.ico': contentType = 'image/x-icon'; break;
        }

        fs.readFile(filePath, (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    fs.readFile(path.join(__dirname, 'index.html'), (err2, data2) => {
                        if (err2) {
                            console.error('Error reading index.html:', err2);
                            res.writeHead(500);
                            res.end('Server Error');
                        } else {
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.end(data2);
                        }
                    });
                } else {
                    console.error('File read error:', err);
                    res.writeHead(500);
                    res.end('Server Error');
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            }
        });
    } catch (e) {
        console.error('Server error:', e);
        res.writeHead(500);
        res.end('Server Error');
    }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
