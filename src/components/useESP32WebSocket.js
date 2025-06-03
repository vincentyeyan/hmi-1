import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for WebSocket connection to an ESP32 device
 * @param {string} ipAddress - The IP address of the ESP32
 * @param {number} port - The WebSocket port number
 * @param {boolean} autoConnect - Whether to connect automatically on mount
 * @returns {Object} WebSocket connection state and methods
 */
const useESP32WebSocket = (ipAddress = '', port = 81, autoConnect = false) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  
  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!ipAddress) {
      setErrorMessage('Please enter an IP address');
      return;
    }

    if (wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || 
                          wsRef.current.readyState === WebSocket.OPEN)) {
      return; // Already connecting or connected
    }

    try {
      setIsConnecting(true);
      setErrorMessage('');
      
      const ws = new WebSocket(`ws://${ipAddress}:${port}/ws`);
      
      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        console.log('WebSocket connected');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setMessages(prev => [...prev, data]);
        } catch (e) {
          // If not JSON, add as string
          setMessages(prev => [...prev, { type: 'text', data: event.data, timestamp: new Date().toISOString() }]);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setErrorMessage('WebSocket error occurred');
        setIsConnecting(false);
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        
        // Attempt to reconnect after 5 seconds
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
        }
        
        reconnectTimerRef.current = setTimeout(() => {
          if (wsRef.current === ws) { // Only reconnect if this ws is still the current one
            connect();
          }
        }, 5000);
      };
      
      wsRef.current = ws;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setErrorMessage(`Connection error: ${error.message}`);
      setIsConnecting(false);
    }
  }, [ipAddress, port]);

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  // Send message through WebSocket
  const sendMessage = useCallback((data) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setErrorMessage('WebSocket is not connected');
      return false;
    }
    
    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      wsRef.current.send(message);
      return true;
    } catch (error) {
      setErrorMessage(`Failed to send message: ${error.message}`);
      return false;
    }
  }, []);

  // Clear message history
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Connect on mount if autoConnect is true
  useEffect(() => {
    if (autoConnect && ipAddress) {
      connect();
    }
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, ipAddress, connect, disconnect]);

  return {
    isConnected,
    isConnecting,
    messages,
    errorMessage,
    connect,
    disconnect,
    sendMessage,
    clearMessages
  };
};

export default useESP32WebSocket; 