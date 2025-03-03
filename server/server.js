const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

const clients = new Set();
const drawHistory = [];

function getRandomColor() {
    const r = Math.floor(Math.random() * 200) + 55; 
    const g = Math.floor(Math.random() * 200) + 55; 
    const b = Math.floor(Math.random() * 200) + 55; 
    
    const rHex = r.toString(16).padStart(2, '0');
    const gHex = g.toString(16).padStart(2, '0');
    const bHex = b.toString(16).padStart(2, '0');
    
    return `#${rHex}${gHex}${bHex}`;
}

function broadcastMessage(data, sender) {
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    
    clients.forEach((client) => {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

wss.on('connection', (ws) => {
    console.log('New client connected');
    clients.add(ws);
    
    const clientColor = getRandomColor();
    console.log('Generated color for client:', clientColor);
    
    ws.color = clientColor;
    
    const colorMessage = {
        type: 'color',
        color: clientColor
    };
    
    console.log('Sending color message to client:', JSON.stringify(colorMessage));
    ws.send(JSON.stringify(colorMessage));
    
    console.log(`Sending ${drawHistory.length} previous lines to the new client`);
    drawHistory.forEach(item => {
        ws.send(JSON.stringify(item));
    });

    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data);
            console.log('Received message from client of type:', message.type);
            
            if (message.type === 'draw') {
                drawHistory.push(message);
                
                if (drawHistory.length > 1000) {
                    drawHistory.shift();
                }
                
                broadcastMessage(message, ws);
            } else if (message.type === 'clear') {
                console.log('Received canvas clear command');
                
                drawHistory.length = 0;
                
                broadcastMessage({ type: 'clear' }, null);
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        clients.delete(ws);
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clients.delete(ws);
    });
});

console.log('WebSocket server running at ws://localhost:8080');
