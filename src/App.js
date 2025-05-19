import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import DropArea from './components/DropArea';
import ImageGallery from './components/ImageGallery';
import Sidebar from './components/Sidebar';
import TouchDragHandler from './components/TouchDragHandler';
// Import the gallery images from our images folder
import { galleryImages } from './images';

function App() {
  const [placedImages, setPlacedImages] = useState(Array(8).fill(null));
  const [editMode, setEditMode] = useState(false);

  // Wrap handleDrop in useCallback to prevent it from changing on every render
  const handleDrop = useCallback((data, targetIndex) => {
    setPlacedImages(prevImages => {
      const newPlacedImages = [...prevImages];
      
      // If image is coming from another drop area, clear that position
      if (data.sourceIndex !== null) {
        newPlacedImages[data.sourceIndex] = null;
      }
      
      // Place the image in the target position
      newPlacedImages[targetIndex] = {
        id: data.id,
        url: data.url
      };
      
      return newPlacedImages;
    });
  }, []);

  // Expose handleDrop to window for direct access from touch handler
  // This is a workaround for iPad touch events
  useEffect(() => {
    window.reactAppInstance = {
      handleDrop
    };
    return () => {
      delete window.reactAppInstance;
    };
  }, [handleDrop]);

  const handleRemove = (index) => {
    if (!editMode) return;
    
    const newPlacedImages = [...placedImages];
    newPlacedImages[index] = null;
    setPlacedImages(newPlacedImages);
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  // Exit edit mode when clicking outside
  const handleOutsideClick = (e) => {
    if (editMode && 
        !e.target.closest('.remove-icon') && 
        !e.target.closest('img')) {
      setEditMode(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <TouchDragHandler />
      <div className={`main-content ${editMode ? 'edit-mode' : ''}`} onClick={handleOutsideClick}>
        <div className="content-wrapper">
          <ImageGallery images={galleryImages} placedImages={placedImages} />
          <div className="drop-zones-wrapper">
            <div className="background-image"></div>
            <div className="drop-zone-title">
              <h1>Steering Wheel Buttons</h1>
              <p className="instruction-text">Long press an action, then drag and drop it to a button module.<br />Long press a button to remove an action.</p>
            </div>
          <DropArea 
            placedImages={placedImages}
            onDrop={handleDrop}
            onRemove={handleRemove}
            editMode={editMode}
            toggleEditMode={toggleEditMode}
          />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
