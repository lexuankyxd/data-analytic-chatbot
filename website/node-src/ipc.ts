const net = require('net');

const socketPath = '/tmp/chatbot.sock'; // Path to the server's socket file

// const client = net.createConnection({ path: socketPath }, () => {
//   console.log('Connected to server via UDS');
//   client.write('Hello from client!');
// });

// client.on('data', (data: Buffer) => {
//   console.log('Received:', data.toString());
// });

// client.on('end', () => {
//   console.log('Disconnected from server');
// });

// client.on('error', (err: Error) => {
//   console.error('Socket error:', err);
// });
