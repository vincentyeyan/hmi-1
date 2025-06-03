import React, { useRef, useEffect } from 'react';
import { galleryCategories } from '../images';

function ImageGallery({ images, placedImages }) {
  const scrollRef = useRef(null);
  let isDown = false;
  let startX;
  let scrollLeft;
  let dragThreshold = 10; // pixels to move before canceling click and treating as scroll
  let startDragX;
  let startDragY;

  const handleDragStart = (e, image) => {
    // Enable immediate dragging with no delay
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      
      // Create a ghost image that's slightly transparent
      const ghostElement = document.createElement('div');
      ghostElement.style.width = '60px';
      ghostElement.style.height = '60px';
      ghostElement.style.background = 'transparent';
      document.body.appendChild(ghostElement);
      
      e.dataTransfer.setDragImage(ghostElement, 30, 30);
      
      // Clean up ghost element after drag starts
      setTimeout(() => {
        document.body.removeChild(ghostElement);
      }, 0);
      
    const data = {
      id: image.id,
      url: image.url,
      sourceIndex: null
    };
      
    e.dataTransfer.setData('text/plain', JSON.stringify(data));
    }
  };

  // Check if an image has been placed
  const isImagePlaced = (imageId) => {
    return placedImages.some(item => item && item.id === imageId);
  };
  
  // Start potential drag tracking on mousedown
  const onItemMouseDown = (e) => {
    startDragX = e.clientX;
    startDragY = e.clientY;
  };
  
  // Cancel event bubbling if we didn't move much
  const onItemClick = (e, action) => {
    if (Math.abs(e.clientX - startDragX) < 5 && Math.abs(e.clientY - startDragY) < 5) {
      // It was a click, not a drag attempt
    } else {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Mouse-based scrolling for the gallery
  const onMouseDown = (e) => {
    if (!scrollRef.current || e.target.closest('.gallery-item')) return;
    isDown = true;
    scrollRef.current.style.cursor = 'grabbing';
    startX = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft = scrollRef.current.scrollLeft;
    e.preventDefault(); // Prevent default to avoid text selection
  };

  const onMouseLeave = () => {
    if (!scrollRef.current) return;
    isDown = false;
    scrollRef.current.style.cursor = 'grab';
  };

  const onMouseUp = () => {
    if (!scrollRef.current) return;
    isDown = false;
    scrollRef.current.style.cursor = 'grab';
  };

  const onMouseMove = (e) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // Prevent touchmove default behavior on the scroll container
  const preventDefaultTouch = (e) => {
    // Only prevent default if we're scrolling vertically
    if (Math.abs(e.touches[0].clientX - startDragX) < 
        Math.abs(e.touches[0].clientY - startDragY)) {
      e.stopPropagation();
    }
  };

  // Add data attributes to gallery items for drag handler
  useEffect(() => {
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, index) => {
      const imageId = item.getAttribute('data-image-id');
      if (!imageId) {
        item.setAttribute('data-image-id', images[index]?.id || '');
      }
    });

    // Add touch event listeners to prevent scroll propagation
    if (scrollRef.current) {
      const scrollElement = scrollRef.current;
      
      const touchStartHandler = (e) => {
        startDragX = e.touches[0].clientX;
        startDragY = e.touches[0].clientY;
      };

      scrollElement.addEventListener('touchstart', touchStartHandler, { passive: false });
      scrollElement.addEventListener('touchmove', preventDefaultTouch, { passive: false });

      return () => {
        scrollElement.removeEventListener('touchstart', touchStartHandler);
        scrollElement.removeEventListener('touchmove', preventDefaultTouch);
      };
    }
  }, [images]);

  // Fix for handling the image URL correctly
  const getImageUrl = (imageUrl) => {
    if (typeof imageUrl === 'string') {
      return imageUrl; // If it's already a string URL, use it directly
    } else if (imageUrl && imageUrl.default) {
      return imageUrl.default; // For webpack imported images
    }
    return ''; // Fallback
  };

  return (
    <div className="gallery-container">
      <h3 className="gallery-title">Button Actions</h3>
      <div 
        className="image-gallery-wrapper"
        ref={scrollRef}
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
      >
        <div className="image-gallery">
          {galleryCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="gallery-category">
              <h4 className="category-title">{category.name}</h4>
              <div className="category-items">
                {category.items.map(image => (
                  <div 
                    key={image.id}
                    className={`gallery-item ${isImagePlaced(image.id) ? 'placed' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, image)}
                    onMouseDown={onItemMouseDown}
                    onClick={onItemClick}
                    data-image-id={image.id}
                  >
                    <img 
                      src={getImageUrl(image.url)} 
                      alt={image.alt} 
                      draggable={false} // Prevent image dragging to improve overall drag experience
                    />
                    <div className="gallery-item-name">{image.alt}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ImageGallery; 