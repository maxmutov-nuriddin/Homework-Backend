import http from 'http';

let students = [
   { id: 1, name: 'Ali', age: 15 },
   { id: 2, name: 'Laylo', age: 14 }
];
let idCounter = 3;
let totalRequests = 0;
let lastRequestTime = null;

http.createServer((req, res) => {
   totalRequests++;
   lastRequestTime = new Date().toISOString();

   if (req.method === 'GET' && req.url === '/students') {
      setTimeout(() => {
         res.writeHead(200, { 'Content-Type': 'application/json' });
         res.end(JSON.stringify({ students }));
      }, 500);

   } else if (req.method === 'POST' && req.url === '/students') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
         try {
            const newStudent = { id: idCounter++, ...JSON.parse(body) };
            students.push(newStudent);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ students }));
         } catch {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
         }
      });

   } else if (req.method === 'GET' && req.url === '/stats') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
         totalRequests,
         studentsCount: students.length,
         lastRequestTime
      }));

   } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
   }

}).listen(3000, () => console.log('Server running on http://localhost:3000'));
