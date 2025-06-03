import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing connection to an ESP32 device
 * @param {string} initialIpAddress - The initial IP address to connect to
 * @param {number} timeoutMs - Timeout for fetch requests in milliseconds
 * @returns {Object} Connection state and methods
 */
const useESP32Connection = (initialIpAddress = '192.168.4.1', timeoutMs = 5000) => {
  const [ipAddress, setIpAddress] = useState(initialIpAddress);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [errorMessage, setErrorMessage] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);

  // Reset error message when IP address changes
  useEffect(() => {
    setErrorMessage('');
  }, [ipAddress]);

  // Create a fetch method with timeout
  const fetchWithTimeout = useCallback(async (url, options = {}) => {
    const controller = new AbortController();
    const signal = controller.signal;
    
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(url, { ...options, signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }, [timeoutMs]);

  // Function to connect to ESP32
  const connect = useCallback(async () => {
    if (!ipAddress) {
      setErrorMessage('Please enter an IP address');
      return false;
    }

    try {
      setIsConnecting(true);
      setConnectionStatus('connecting');
      setErrorMessage('');
      
      const response = await fetchWithTimeout(`http://${ipAddress}/ping`, { 
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConnectionStatus('connected');
        setLastResponse(data);
        return true;
      } else {
        setConnectionStatus('error');
        setErrorMessage(`Error: ${response.status} ${response.statusText}`);
        return false;
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(`Connection failed: ${error.message}`);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [ipAddress, fetchWithTimeout]);

  // Function to send a command to ESP32
  const sendCommand = useCallback(async (endpoint, data = null) => {
    if (connectionStatus !== 'connected') {
      setErrorMessage('Please connect to ESP32 first');
      return null;
    }

    try {
      setIsConnecting(true);
      setErrorMessage('');
      
      const options = {
        method: data ? 'POST' : 'GET',
        headers: {
          'Accept': 'application/json',
        }
      };
      
      if (data) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(data);
      }
      
      const response = await fetchWithTimeout(`http://${ipAddress}/${endpoint}`, options);

      if (response.ok) {
        const responseData = await response.json();
        setLastResponse(responseData);
        return responseData;
      } else {
        setErrorMessage(`Error: ${response.status} ${response.statusText}`);
        return null;
      }
    } catch (error) {
      setErrorMessage(`Command failed: ${error.message}`);
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [connectionStatus, ipAddress, fetchWithTimeout]);

  // Function to disconnect from ESP32
  const disconnect = useCallback(() => {
    setConnectionStatus('disconnected');
    setLastResponse(null);
  }, []);

  return {
    // State
    ipAddress,
    connectionStatus,
    errorMessage,
    isConnecting,
    lastResponse,
    
    // Actions
    setIpAddress,
    connect,
    disconnect,
    sendCommand,
    
    // Helper method to test connection
    sendTestCommand: useCallback(() => sendCommand('setState', { test: true }), [sendCommand])
  };
};

export default useESP32Connection; 