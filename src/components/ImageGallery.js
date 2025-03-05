import React from 'react';

function ImageGallery({ images }) {
  const handleDragStart = (e, image) => {
    const data = {
      id: image.id,
      url: image.url,
      sourceIndex: null
    };
    e.dataTransfer.setData('text/plain', JSON.stringify(data));
  };

  return (
    <div className="gallery-container">
      <div className="image-gallery">
        {images.map(image => (
          <div 
            key={image.id}
            className="gallery-item"
            draggable
            onDragStart={(e) => handleDragStart(e, image)}
          >
            <img 
              src={image.url} 
              alt={image.alt} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ImageGallery; 