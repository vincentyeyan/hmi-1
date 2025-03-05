import React, { useRef } from 'react';

function DropArea({ placedImages, onDrop, onRemove, editMode, toggleEditMode }) {
  const longPressTimerRef = useRef(null);
  const longPressDuration = 500; // ms

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    onDrop(data, targetIndex);
  };

  const startLongPress = () => {
    longPressTimerRef.current = setTimeout(() => {
      toggleEditMode();
    }, longPressDuration);
  };

  const cancelLongPress = () => {
    clearTimeout(longPressTimerRef.current);
  };

  return (
    <div className="drop-area">
      {Array(6).fill().map((_, index) => (
        <div 
          key={index}
          className="drop-square"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
          data-index={index}
        >
          <div 
            className="remove-icon" 
            onClick={() => onRemove(index)}
          >
            -
          </div>
          
          {placedImages[index] && (
            <img 
              src={placedImages[index].url}
              alt={`Placed Image ${placedImages[index].id}`}
              draggable
              onDragStart={(e) => {
                const data = {
                  id: placedImages[index].id,
                  url: placedImages[index].url,
                  sourceIndex: index
                };
                e.dataTransfer.setData('text/plain', JSON.stringify(data));
              }}
              onMouseDown={startLongPress}
              onTouchStart={startLongPress}
              onMouseUp={cancelLongPress}
              onMouseLeave={cancelLongPress}
              onTouchEnd={cancelLongPress}
              onTouchCancel={cancelLongPress}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default DropArea; 