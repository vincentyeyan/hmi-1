# ESP32 Connection Components

This module provides React components and hooks for connecting to an ESP32 microcontroller over WiFi.

## Components

### `ESP32Connection`

A React component that provides a UI for connecting to an ESP32 device via HTTP.

```jsx
import ESP32Connection from './components/ESP32Connection';

function App() {
  return (
    <div>
      <ESP32Connection />
    </div>
  );
}
```

## Custom Hooks

### `useESP32Connection`

A custom hook for managing HTTP connections to an ESP32 device.

```jsx
import useESP32Connection from './components/useESP32Connection';

function MyComponent() {
  const {
    ipAddress,
    connectionStatus,
    errorMessage,
    isConnecting,
    lastResponse,
    setIpAddress,
    connect,
    disconnect,
    sendCommand,
    sendTestCommand
  } = useESP32Connection('192.168.4.1');

  // Use these methods and state in your component
}
```

#### Parameters

- `initialIpAddress` (string, default: '192.168.4.1'): The initial IP address to connect to
- `timeoutMs` (number, default: 5000): Timeout for fetch requests in milliseconds

#### Returns

- `ipAddress` (string): Current IP address
- `connectionStatus` (string): Current connection status ('disconnected', 'connecting', 'connected', 'error')
- `errorMessage` (string): Error message if any
- `isConnecting` (boolean): Whether currently connecting
- `lastResponse` (object): Last response received from the ESP32
- `setIpAddress` (function): Function to update the IP address
- `connect` (function): Function to connect to the ESP32
- `disconnect` (function): Function to disconnect from the ESP32
- `sendCommand` (function): Function to send a command to the ESP32
- `sendTestCommand` (function): Helper function to send a test command

### `useESP32WebSocket`

A custom hook for managing WebSocket connections to an ESP32 device.

```jsx
import useESP32WebSocket from './components/useESP32WebSocket';

function MyComponent() {
  const {
    isConnected,
    isConnecting,
    messages,
    errorMessage,
    connect,
    disconnect,
    sendMessage,
    clearMessages
  } = useESP32WebSocket('192.168.4.1', 81, true);

  // Use these methods and state in your component
}
```

#### Parameters

- `ipAddress` (string, default: ''): The IP address of the ESP32
- `port` (number, default: 81): The WebSocket port number
- `autoConnect` (boolean, default: false): Whether to connect automatically on mount

#### Returns

- `isConnected` (boolean): Whether connected to WebSocket
- `isConnecting` (boolean): Whether currently connecting
- `messages` (array): Array of received messages
- `errorMessage` (string): Error message if any
- `connect` (function): Function to connect to WebSocket
- `disconnect` (function): Function to disconnect from WebSocket
- `sendMessage` (function): Function to send a message through WebSocket
- `clearMessages` (function): Function to clear message history

## ESP32 Setup

On your ESP32, you'll need to:

1. Set up a WiFi access point or connect to your local network
2. Implement HTTP endpoints:
   - `/ping`: For testing connection (GET)
   - `/setState`: For changing state (POST)
3. Optionally implement a WebSocket server on port 81

### Example Arduino Code

```cpp
#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <WebSocketsServer.h>

const char* ssid = "ESP32-AP";
const char* password = "password123";

WebServer server(80);
WebSocketsServer webSocket = WebSocketsServer(81);

void setup() {
  Serial.begin(115200);
  
  // Set up Access Point
  WiFi.softAP(ssid, password);
  Serial.print("AP IP address: ");
  Serial.println(WiFi.softAPIP());
  
  // Set up HTTP endpoints
  server.on("/ping", HTTP_GET, handlePing);
  server.on("/setState", HTTP_POST, handleSetState);
  
  server.begin();
  
  // Set up WebSocket
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}

void loop() {
  server.handleClient();
  webSocket.loop();
}

void handlePing() {
  StaticJsonDocument<200> doc;
  doc["status"] = "ok";
  doc["device"] = "ESP32";
  doc["uptime"] = millis() / 1000;
  
  String response;
  serializeJson(doc, response);
  
  server.send(200, "application/json", response);
}

void handleSetState() {
  if (server.hasArg("plain")) {
    String body = server.arg("plain");
    StaticJsonDocument<200> doc;
    deserializeJson(doc, body);
    
    // Process the command
    bool test = doc["test"];
    
    // Send response
    StaticJsonDocument<200> responseDoc;
    responseDoc["status"] = "ok";
    responseDoc["received"] = true;
    responseDoc["test"] = test;
    
    String response;
    serializeJson(responseDoc, response);
    
    server.send(200, "application/json", response);
  } else {
    server.send(400, "application/json", "{\"status\":\"error\",\"message\":\"No body\"}");
  }
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Disconnected!\n", num);
      break;
    case WStype_CONNECTED:
      {
        IPAddress ip = webSocket.remoteIP(num);
        Serial.printf("[%u] Connected from %d.%d.%d.%d\n", num, ip[0], ip[1], ip[2], ip[3]);
        
        // Send welcome message
        webSocket.sendTXT(num, "{\"type\":\"welcome\",\"message\":\"Connected to ESP32\"}");
      }
      break;
    case WStype_TEXT:
      {
        String text = String((char *) payload);
        Serial.printf("[%u] Received: %s\n", num, text.c_str());
        
        // Echo back
        String response = "{\"type\":\"echo\",\"data\":\"" + text + "\"}";
        webSocket.sendTXT(num, response);
      }
      break;
  }
}
``` 