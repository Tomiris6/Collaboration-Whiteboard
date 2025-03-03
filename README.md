# Collaborative Whiteboard

A real-time collaborative whiteboard application that allows multiple users to draw together on a shared canvas. Each user is assigned a unique color, and all drawing actions are synchronized across all connected clients.

## Features

- Real-time drawing synchronization across multiple devices
- Automatic color assignment for each user
- Persistent drawing history for new connections
- Touch screen support for mobile devices
- Adjustable brush size
- Clear canvas functionality (synchronized for all users)
- Connection status indicator
- Automatic reconnection attempts on connection loss

## Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5 Canvas, WebSockets
- **Backend**: Node.js with `ws` WebSocket library

## Installation

### Prerequisites

- Node.js (v12 or higher)
- npm (comes with Node.js)

### Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd collaborative-whiteboard
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

4. Open the application in your browser:
   - Open `main.html` directly in your browser, or
   - Set up a simple HTTP server (like `live-server` or `http-server`) to serve the static files

## Usage

1. Open the application in multiple browser windows or devices (connected to the same network)
2. Start drawing on the canvas
3. All connected users will see your drawings in real-time
4. Use the brush size slider to adjust the line thickness
5. Use the "Clear Canvas" button to clear the canvas for all users

## Testing

To test the application:

1. Start the server using `npm start`
2. Open `main.html` in multiple browser windows
3. Try drawing in one window and observe the changes appearing in the other window(s)
4. Test the clear canvas functionality to see if it clears for all users
5. Test network disruption scenarios:
   - Disable your internet connection while using the application
   - Observe the status changing to "Disconnected" or "Reconnecting..."
   - Re-enable your internet connection to see it automatically reconnect

## Technical Details

## Key Components

### Server-side (`server.js`)

The server is built using Node.js with the `ws` WebSocket library. Its main responsibilities include:

1. **Client Management**
   - Maintains a set of all connected clients
   - Assigns a unique color to each client upon connection
   - Tracks client disconnections

2. **Drawing History**
   - Stores all drawing actions in an array (`drawHistory`)
   - Limits history to the most recent 1000 actions to prevent memory issues
   - Sends the entire drawing history to new clients when they connect

3. **Message Broadcasting**
   - Forwards drawing events from one client to all other clients
   - Broadcasts canvas clear commands to all clients

4. **Message Handling**
   - Processes different types of messages:
     - `draw`: Drawing actions
     - `clear`: Canvas clear commands

### Client-side (`app.js`, `main.html`)

The client is built using standard web technologies:

1. **Canvas Management**
   - Renders the whiteboard using HTML5 Canvas
   - Resizes the canvas to fit the container
   - Provides drawing functionality

2. **User Input Handling**
   - Captures mouse events (down, move, up)
   - Provides touch event support for mobile devices
   - Converts touch events to equivalent mouse events

3. **WebSocket Communication**
   - Establishes and maintains WebSocket connection
   - Sends drawing data to the server
   - Processes incoming drawing data from other clients

4. **UI Components**
   - Status indicator showing connection state
   - Color indicator showing the user's assigned color
   - Brush size adjustment
   - Clear canvas button

## Communication Flow

### Connection Establishment

1. When a client connects to the server:
   - The server adds the client to its set of connected clients
   - The server generates a random color for the client
   - The server sends the assigned color to the client
   - The server sends the entire drawing history to the client

2. The client:
   - Displays the connection status as "Connected"
   - Sets its drawing color to the assigned color
   - Renders any existing drawing history

### Drawing Process

When a user draws on the canvas:

1. **Client-side**:
   - The user's mouse/touch movement is captured
   - A line is drawn on the local canvas
   - The line data (start/end points, color, width) is stored in the local drawing history
   - The line data is sent to the server via WebSocket

2. **Server-side**:
   - The server receives the line data
   - The server adds the line data to its drawing history
   - The server broadcasts the line data to all other connected clients

3. **Other clients**:
   - Receive the line data from the server
   - Draw the line on their canvases
   - Add the line data to their local drawing histories

### Canvas Clearing

When a user clicks the "Clear Canvas" button:

1. **Client-side**:
   - The local canvas is cleared
   - A clear command is sent to the server

2. **Server-side**:
   - The server clears its drawing history
   - The server broadcasts the clear command to all connected clients

3. **Other clients**:
   - Receive the clear command
   - Clear their canvases and local drawing histories

## Network Disruption Handling

The application implements several strategies to handle network disruptions:

### Server-side Handling

The server is designed to:
- Detect client disconnections through the WebSocket `close` event
- Remove disconnected clients from its set of active clients
- Handle errors gracefully without crashing

### Client-side Handling

The client implements:

1. **Connection Status Tracking**
   - Updates the UI to show the current connection status:
     - "Connected" (green)
     - "Connecting" (orange)
     - "Disconnected" (red)
     - "Reconnecting in Xs..." (during reconnection attempts)

2. **Automatic Reconnection**
   - When the connection is lost, the client automatically attempts to reconnect
   - Uses an exponential backoff strategy (starting at 1 second, increasing by a factor of 1.5)
   - Limits reconnection attempts to a maximum of 5
   - Displays the countdown to the next reconnection attempt

3. **Local Drawing Persistence**
   - Maintains a local copy of the drawing history
   - Continues to allow the user to draw even when disconnected
   - Redraws the canvas when resizing or reconnecting

## Performance Considerations

1. **Drawing History Limitation**
   - The server limits the drawing history to 1000 items to prevent memory issues
   - This means that very old drawing actions may be lost if the whiteboard is heavily used

2. **Canvas Optimization**
   - The canvas is resized to fit its container, balancing quality and performance
   - Drawing operations are kept simple (lines only) to ensure smooth performance

3. **WebSocket Message Size**
   - Messages are kept small, containing only essential information:
     - Line start/end coordinates
     - Color
     - Line width
    
# Future Improvements 
Here are possible impovements and suggestions to the project.
### Short-term Improvements (1-2 weeks)

1. **User Experience Enhancements**
   - Add undo/redo functionality
   - Implement different drawing tools (rectangle, circle, line, text)
   - Add color picker for user color selection

2. **Performance Optimizations**
   - Batch drawing updates to reduce WebSocket traffic
   - Add compression for WebSocket messages

3. **Reliability Improvements**
   - Add server-side logging for troubleshooting
   - Add better error handling and user feedback
   - Implement message queue for dropped messages during disconnection

### Medium-term Roadmap (1-3 months)

1. **Persistence and Session Management**
   - Implement user authentication
   - Add whiteboard rooms/sessions

2. **Advanced Features**
   - Add image upload and embedding
   - Implement collaborative text editing
   - Add basic shapes and object manipulation

### Long-term Vision (3+ months)

1. **Enterprise Features**
   - Add user roles and permissions
   - Create organization management

2. **Advanced Collaboration**
   - Add voice and video chat integration
   - Implement cursor presence (see other users' cursors)
