import React from 'react';
import useESP32Connection from './useESP32Connection';

const ESP32Connection = () => {
  const {
    ipAddress,
    connectionStatus,
    errorMessage,
    isConnecting,
    lastResponse,
    setIpAddress,
    connect,
    disconnect,
    sendTestCommand
  } = useESP32Connection();

  // Get status color for visual feedback
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#4CAF50'; // green
      case 'connecting': return '#FFC107'; // yellow
      case 'error': return '#F44336'; // red
      default: return '#9E9E9E'; // gray for disconnected
    }
  };

  return (
    <div className="esp32-connection" style={{ 
      padding: '20px', 
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      backgroundColor: 'rgba(25, 26, 36, 0.7)',
      border: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      <h3 style={{ marginTop: 0, color: 'rgba(255, 255, 255, 0.9)', marginBottom: '15px' }}>ESP32 Connection</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="ip-address" style={{ display: 'block', marginBottom: '5px', color: 'rgba(255, 255, 255, 0.8)' }}>
          ESP32 IP Address:
        </label>
        <input
          id="ip-address"
          type="text"
          value={ipAddress}
          onChange={(e) => setIpAddress(e.target.value)}
          placeholder="e.g. 192.168.4.1"
          style={{ 
            width: '100%', 
            padding: '8px',
            boxSizing: 'border-box',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
            backgroundColor: 'rgba(30, 32, 45, 0.6)',
            color: 'white'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        {connectionStatus !== 'connected' ? (
          <button
            onClick={connect}
            disabled={isConnecting}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              flex: '1',
              opacity: isConnecting ? 0.7 : 1
            }}
          >
            {isConnecting ? 'Connecting...' : 'Connect'}
          </button>
        ) : (
          <button
            onClick={disconnect}
            style={{
              padding: '8px 16px',
              backgroundColor: '#F44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              flex: '1'
            }}
          >
            Disconnect
          </button>
        )}
        
        <button
          onClick={sendTestCommand}
          disabled={connectionStatus !== 'connected' || isConnecting}
          style={{
            padding: '8px 16px',
            backgroundColor: '#673AB7',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: connectionStatus !== 'connected' ? 'not-allowed' : 'pointer',
            flex: '1',
            opacity: (connectionStatus !== 'connected' || isConnecting) ? 0.7 : 1
          }}
        >
          Send Test
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(),
            }}
          />
          <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Status: {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
          </span>
        </div>
        
        {errorMessage && (
          <div style={{ 
            color: '#F44336', 
            marginTop: '5px', 
            fontSize: '14px' 
          }}>
            {errorMessage}
          </div>
        )}
      </div>

      {lastResponse && (
        <div style={{ 
          marginTop: '15px',
          padding: '10px',
          backgroundColor: 'rgba(30, 32, 45, 0.6)',
          borderRadius: '4px',
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.8)'
        }}>
          <strong>Last Response:</strong>
          <pre style={{ 
            margin: '5px 0 0',
            whiteSpace: 'pre-wrap',
            overflow: 'auto',
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
            {JSON.stringify(lastResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ESP32Connection; 