import React, { useRef, useEffect } from 'react';
import { galleryImages } from '../images'; // Import galleryImages to get alt text

function DropArea({ placedImages, onDrop, onRemove, editMode, toggleEditMode }) {
  const longPressTimerRef = useRef(null);
  const longPressDuration = 1200; // ms - increased from 500ms to 1.2 seconds
  const touchStartRef = useRef({ x: 0, y: 0 });
  const movementThreshold = 10; // pixels - how much movement is allowed before canceling long press

  // Helper function to get image name from id
  const getImageName = (imageId) => {
    const image = galleryImages.find(img => img.id === imageId);
    return image ? image.alt : '';
  };

  // Add effect to ensure indexes are added after render
  useEffect(() => {
    // Add data-index attributes to all drop items
    const dropItems = document.querySelectorAll('.drop-item');
    dropItems.forEach((item, idx) => {
      item.setAttribute('data-index', idx.toString());
    });
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    onDrop(data, targetIndex);
  };

  // Prevent context menu on mobile devices
  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  // Start long press timer
  const startLongPress = (e) => {
    // Get the target element
    const dropContent = e.target.closest('.drop-content');
    
    // Store initial position for movement detection
    if (e.touches && e.touches[0]) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
    
    cancelLongPress(); // Clear any existing timer
    
    // Add visual feedback after a short delay (300ms)
    setTimeout(() => {
      if (longPressTimerRef.current && dropContent) {
        dropContent.classList.add('long-pressing');
      }
    }, 300);
    
    // Set the actual long press timer
    longPressTimerRef.current = setTimeout(() => {
      // Only toggle if we're not in edit mode already
      if (!editMode) {
        toggleEditMode();
      }
      
      // Remove visual indicator
      if (dropContent) {
        dropContent.classList.remove('long-pressing');
      }
    }, longPressDuration);
  };
  
  // Check if touch moved too much to be a long press
  const checkTouchMovement = (e) => {
    if (!e.touches || !e.touches[0]) return;
    
    const { x: startX, y: startY } = touchStartRef.current;
    const { clientX, clientY } = e.touches[0];
    
    const distance = Math.sqrt(
      Math.pow(clientX - startX, 2) + 
      Math.pow(clientY - startY, 2)
    );
    
    if (distance > movementThreshold) {
      cancelLongPress();
    }
  };

  // Handle regular mouse events (non-touch)
  const handleMouseDown = (e) => {
    // Only use for actual mouse, not touch events
    if (e.pointerType === 'touch') return;
    
    // Start long press timer
    longPressTimerRef.current = setTimeout(() => {
      toggleEditMode();
    }, longPressDuration);
  };

  // Long press detection for edit mode
  const cancelLongPress = () => {
    // Remove visual indicator from all drop-content elements
    document.querySelectorAll('.drop-content.long-pressing').forEach(el => {
      el.classList.remove('long-pressing');
    });
    
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Function to render a single drop item
  const renderDropItem = (index) => (
    <div
      key={index}
      className="drop-item"
      data-index={index.toString()}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, index)}
    >
      {editMode && (
        <div 
          className={`remove-icon ${!placedImages[index] ? 'empty-remove' : ''}`}
          onClick={() => onRemove(index)}
        >
          {/* Remove the text content since we're using ::before */}
        </div>
      )}
      
      {placedImages[index] ? (
        <>
          <div 
            className="drop-content has-image"
            data-parent-index={index.toString()}
            onContextMenu={handleContextMenu}
            onTouchStart={startLongPress}
            onTouchMove={checkTouchMovement}
            onTouchEnd={cancelLongPress}
            onTouchCancel={cancelLongPress}
            onClick={(e) => e.preventDefault()}
          >
            <img 
              src={placedImages[index].url}
              alt={`Control ${placedImages[index].id}`}
              draggable
              data-index={index}
              data-id={placedImages[index].id}
              onDragStart={(e) => {
                const data = {
                  id: placedImages[index].id,
                  url: placedImages[index].url,
                  sourceIndex: index
                };
                e.dataTransfer.setData('text/plain', JSON.stringify(data));
              }}
              onMouseDown={handleMouseDown}
              onMouseUp={cancelLongPress}
              onMouseLeave={cancelLongPress}
              onClick={(e) => e.preventDefault()}
            />
          </div>
          <div className="image-title-container">
            <div className="image-title">
              {getImageName(placedImages[index].id)}
            </div>
          </div>
        </>
      ) : (
        <div 
          className="drop-content empty"
          data-parent-index={index.toString()}
          onContextMenu={handleContextMenu}
          onTouchStart={startLongPress}
          onTouchMove={checkTouchMovement}
          onTouchEnd={cancelLongPress}
          onTouchCancel={cancelLongPress}
          onClick={(e) => e.preventDefault()}
        >
          <span className="plus-icon">+</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="drop-grid">
      {/* Left button module with label */}
      <div className="button-module-container left-module">
        <div className="diamond-group">
          {[0, 1, 2, 3].map(index => renderDropItem(index))}
        </div>
        <div className="button-module-label">Left Buttons</div>
      </div>
      
      {/* Right button module with label */}
      <div className="button-module-container right-module">
        <div className="diamond-group">
          {[4, 5, 6, 7].map(index => renderDropItem(index))}
        </div>
        <div className="button-module-label">Right Buttons</div>
      </div>
    </div>
  );
}

export default DropArea; 