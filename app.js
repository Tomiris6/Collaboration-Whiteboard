document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('whiteboard');
    const ctx = canvas.getContext('2d');
    const statusElement = document.getElementById('status');
    const clearButton = document.getElementById('clear-btn');
    const colorIndicator = document.getElementById('color-indicator');
    const brushSize = document.getElementById('brush-size');

    const WS_URL = 'ws://localhost:8080';
    let socket;
    let reconnectTimeout;
    let reconnectAttempts = 0;
    const MAX_RECONNECT_ATTEMPTS = 5;

    let isDrawing = false;
    let lastX, lastY;
    let myColor = '#000000';
    let currentBrushSize = 2;
    let localDrawHistory = [];
    function resizeCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        redrawCanvas();
    }

    function redrawCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        localDrawHistory.forEach(item => {
            drawLine(item.startX, item.startY, item.endX, item.endY, item.color, item.width);
        });
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function drawLine(startX, startY, endX, endY, color, width = 2) {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.stroke();
        ctx.closePath();
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        localDrawHistory = [];
    }

    function handleMouseDown(e) {
        isDrawing = true;
        
        lastX = e.offsetX;
        lastY = e.offsetY;
    }

    function handleMouseMove(e) {
        if (!isDrawing) return;
        
        const lineData = {
            type: 'draw',
            startX: lastX,
            startY: lastY,
            endX: e.offsetX,
            endY: e.offsetY,
            color: myColor,
            width: currentBrushSize
        };
        
        drawLine(lastX, lastY, e.offsetX, e.offsetY, myColor, currentBrushSize);
        
        localDrawHistory.push(lineData);
      
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(lineData));
        }

        lastX = e.offsetX;
        lastY = e.offsetY;
    }

    function handleMouseUp() {
        isDrawing = false;
    }

    function connectWebSocket() {
        statusElement.textContent = 'Connecting...';
        statusElement.className = 'status connecting';

        socket = new WebSocket(WS_URL);

        socket.onopen = () => {
            statusElement.textContent = 'Connected';
            statusElement.className = 'status connected';
            reconnectAttempts = 0;
            console.log('WebSocket connected');
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Received message type:', data.type);
                
                if (data.type === 'color') {
                    myColor = data.color;
                    colorIndicator.style.backgroundColor = myColor;
                    console.log('Assigned color:', myColor);
                } else if (data.type === 'draw') {
                    drawLine(data.startX, data.startY, data.endX, data.endY, data.color, data.width);
                    
                    localDrawHistory.push(data);
                    console.log('Drawing remote line');
                } else if (data.type === 'clear') {
                    clearCanvas();
                    console.log('Canvas cleared by remote command');
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };
        
        socket.onclose = (event) => {
            statusElement.textContent = 'Disconnected';
            statusElement.className = 'status';
            console.log('WebSocket disconnected, code:', event.code, 'reason:', event.reason);

            if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                const delay = Math.min(5000, 1000 * Math.pow(1.5, reconnectAttempts));
                reconnectAttempts++;
                
                statusElement.textContent = `Reconnecting in ${Math.floor(delay/1000)}s...`;

                clearTimeout(reconnectTimeout);
                reconnectTimeout = setTimeout(connectWebSocket, delay);
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    brushSize.addEventListener('input', (e) => {
        currentBrushSize = parseInt(e.target.value);
    });

    clearButton.addEventListener('click', () => {
        clearCanvas();

        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: 'clear'
            }));
            console.log('Sent clear command');
        }
    });

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseout', handleMouseUp);

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        const mouseEvent = new MouseEvent('mouseup');
        canvas.dispatchEvent(mouseEvent);
    });

    window.addEventListener('beforeunload', () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.close();
        }
    });

    connectWebSocket();
});
