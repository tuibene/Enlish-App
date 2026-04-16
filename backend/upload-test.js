const fs = require('fs');
const path = require('path');

// Write a dummy PDF file
fs.writeFileSync('test.pdf', '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');

const fileBuffer = fs.readFileSync('test.pdf');
const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';

let body = `--${boundary}\r\n`;
body += `Content-Disposition: form-data; name="document"; filename="test.pdf"\r\n`;
body += `Content-Type: application/pdf\r\n\r\n`;

const postData = Buffer.concat([
    Buffer.from(body, 'utf8'),
    fileBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8'),
]);

const req = require('http').request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/upload',
    method: 'POST',
    headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': postData.length,
    }
}, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => console.log('Response:', res.statusCode, data));
});

req.on('error', (e) => console.error(e));
req.write(postData);
req.end();
