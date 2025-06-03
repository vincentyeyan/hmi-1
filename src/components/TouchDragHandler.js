// Simplified handler for desktop-only use
import React, { useEffect, useState, useRef } from 'react';

const TouchDragHandler = () => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedElement, setDraggedElement] = useState(null);
  const [touchOffsetX, setTouchOffsetX] = useState(0);
  const [touchOffsetY, setTouchOffsetY] = useState(0);
  const [lastDropTarget, setLastDropTarget] = useState(null);
  const [fingerPosition, setFingerPosition] = useState({ x: 0, y: 0 });
  const touchStartPosRef = useRef({ x: 0, y: 0 });
  const touchTimerRef = useRef(null);
  const isDraggingRef = useRef(false);
  
  // Debug function to show the target element info
  const logElementInfo = (element, x, y) => {
    if (!element) {
      console.log(`No element found at (${x}, ${y})`);
      return;
    }
    
    console.log('Element at point:', {
      tagName: element.tagName,
      className: element.className,
      id: element.id,
      dataset: element.dataset,
      coordinates: `(${x}, ${y})`
    });
    
    // Check for drop-item parents
    let parent = element.closest('.drop-item');
    if (parent) {
      console.log('Found drop-item:', {
        className: parent.className,
        dataIndex: parent.getAttribute('data-index'),
        dataset: parent.dataset
      });
    } else {
      console.log('No .drop-item parent found');
    }
  };
  
  // Helper function to handle image URLs correctly
  const getImageUrl = (imageUrl) => {
    if (typeof imageUrl === 'string') {
      return imageUrl; // If it's already a string URL, use it directly
    } else if (imageUrl && imageUrl.default) {
      return imageUrl.default; // For webpack imported images
    }
    return ''; // Fallback
  };
  
  // Create the visual clone for dragging
  const createDragClone = (element, touchX, touchY, imageUrl) => {
    // Store the center of the element as the drop target detection point
    setFingerPosition({ x: touchX, y: touchY });
    
    // We'll center the clone under the finger for more intuitive dragging
    setTouchOffsetX(40); // Half the width of our 80px box
    setTouchOffsetY(40); // Half the height of our 80px box
    
    // Create the clone with the same dimensions
    const clone = document.createElement('div');
    clone.id = 'drag-clone';
    
    // Create the image element
    const imageClone = document.createElement('img');
    imageClone.src = getImageUrl(imageUrl);
    imageClone.style.width = '100%';
    imageClone.style.height = '100%';
    imageClone.style.objectFit = 'contain';
    
    // Style the clone - center it under the touch point
    clone.style.position = 'fixed';
    clone.style.left = `${touchX - 40}px`; // Center horizontally
    clone.style.top = `${touchY - 40}px`; // Center vertically
    clone.style.width = '80px';
    clone.style.height = '80px';
    clone.style.backgroundColor = 'rgba(10, 17, 40, 0.8)';
    clone.style.border = '1px solid rgba(100, 149, 237, 0.3)';
    clone.style.borderRadius = '8px';
    clone.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
    clone.style.zIndex = '9999';
    clone.style.pointerEvents = 'none'; // Don't interfere with touch events
    clone.style.display = 'flex';
    clone.style.justifyContent = 'center';
    clone.style.alignItems = 'center';
    clone.style.opacity = '0.9';
    
    clone.appendChild(imageClone);
    document.body.appendChild(clone);
    
    // Add dragging class to app layout
    const appLayout = document.querySelector('.app-layout');
    if (appLayout) {
      appLayout.classList.add('dragging');
    }
    
    return clone;
  };
  
  // Move the clone to follow the touch
  const moveClone = (clone, touchX, touchY) => {
    if (!clone) return;
    
    // Center the dragged element under the finger
    clone.style.left = `${touchX - touchOffsetX}px`;
    clone.style.top = `${touchY - touchOffsetY}px`;
    
    // Store current finger position
    setFingerPosition({ x: touchX, y: touchY });
  };
  
  // Remove the clone
  const removeDragClone = (clone) => {
    if (clone && clone.parentNode) {
      clone.parentNode.removeChild(clone);
    }
    
    // Remove dragging class from app layout
    const appLayout = document.querySelector('.app-layout');
    if (appLayout) {
      appLayout.classList.remove('dragging');
    }
  };
  
  // Check if a touch point is over a drop zone
  const getDropTarget = (x, y) => {
    // Use elementFromPoint to find what's under the finger at exact position
    // Hide the clone temporarily for accurate detection
    const clone = document.getElementById('drag-clone');
    
    if (clone) clone.style.display = 'none';
    
    // Get element at the EXACT finger position
    const element = document.elementFromPoint(x, y);
    
    // Log element info for debugging
    logElementInfo(element, x, y);
    
    // Show the clone again
    if (clone) clone.style.display = 'flex';
    
    // Find the closest drop-item by traversing up
    if (!element) return null;
    
    // Try multiple approaches to find the drop target's index
    
    // 1. Check if element or parent is a drop-item with data-index
    let dropItem = element.closest('.drop-item');
    if (dropItem && dropItem.hasAttribute('data-index')) {
      const index = parseInt(dropItem.getAttribute('data-index'), 10);
      console.log('Found drop target via direct .drop-item match with index:', index);
      return { element: dropItem, index };
    }
    
    // 2. Check if we're in a drop-content with data-parent-index
    const dropContent = element.closest('.drop-content');
    if (dropContent && dropContent.hasAttribute('data-parent-index')) {
      const index = parseInt(dropContent.getAttribute('data-parent-index'), 10);
      dropItem = dropContent.closest('.drop-item');
      console.log('Found drop target via .drop-content with parent-index:', index);
      return { element: dropItem || dropContent, index };
    }
    
    // 3. Check if we're in a drop-content and get parent's data-index
    if (dropContent) {
      dropItem = dropContent.closest('.drop-item');
      if (dropItem && dropItem.hasAttribute('data-index')) {
        const index = parseInt(dropItem.getAttribute('data-index'), 10);
        console.log('Found drop target via .drop-content parent with index:', index);
        return { element: dropItem, index };
      }
    }
    
    // 4. Try to find based on diamond-group and position within it
    const diamondGroup = element.closest('.diamond-group');
    if (diamondGroup) {
      // Check if we know which specific child we're over
      const allDropItems = diamondGroup.querySelectorAll('.drop-item');
      for (let i = 0; i < allDropItems.length; i++) {
        const item = allDropItems[i];
        const rect = item.getBoundingClientRect();
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          // We're over this item
          const baseIndex = diamondGroup === document.querySelectorAll('.diamond-group')[0] ? 0 : 4;
          const index = baseIndex + i;
          console.log('Found drop target via position in diamond-group, index:', index);
          return { element: item, index };
        }
      }
    }
    
    console.log('No drop target found');
    return null;
  };
  
  // Start a drag operation from either a gallery item or a drop zone
  const startDragOperation = (element, touch) => {
    // Check if we're dragging from a gallery item or a drop zone item
    const galleryItem = element.closest('.gallery-item');
    const dropContent = element.closest('.drop-content.has-image');
    
    console.log('Starting drag operation', {
      isGalleryItem: !!galleryItem,
      isDropContent: !!dropContent,
      element: element.tagName,
      classList: element.className
    });
    
    // Only continue for appropriate elements
    if (!galleryItem && !dropContent) {
      console.log('Not a draggable element');
      return false;
    }
    
    // Don't allow starting a drag on placed gallery items
    if (galleryItem && galleryItem.classList.contains('placed')) {
      console.log('Gallery item already placed, not starting drag');
      return false;
    }
    
    // Set dragging flag
    isDraggingRef.current = true;
    
    // Get the image ID and source for dragging
    let imageId, imageUrl, sourceIndex = null;
    
    if (galleryItem) {
      // Dragging from gallery
      imageId = galleryItem.getAttribute('data-image-id');
      imageUrl = galleryItem.querySelector('img').src;
    } else if (dropContent) {
      // Dragging from drop zone
      const img = dropContent.querySelector('img');
      imageId = img.getAttribute('data-id');
      imageUrl = img.src;
      sourceIndex = parseInt(img.getAttribute('data-index'), 10);
    }
    
    // Create data object for drop handling
    const data = {
      id: parseInt(imageId, 10),
      url: imageUrl,
      sourceIndex
    };
    
    // Store data for drop handling
    setDraggedItem(data);
    
    // Store touch coordinates
    const touchX = touch.clientX;
    const touchY = touch.clientY;
    
    // Create visual element
    const clone = createDragClone(element, touchX, touchY, imageUrl);
    setDraggedElement(clone);
    
    return true;
  };
  
  // Calculate distance between two points
  const getDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };
  
  useEffect(() => {
    // Add data-index attributes to all drop items
    const addIndices = () => {
      const dropItems = document.querySelectorAll('.drop-item');
      dropItems.forEach((item, idx) => {
        item.setAttribute('data-index', idx.toString());
      });
    };
    
    // Add indices when the component mounts
    addIndices();
    
    // Add the necessary event listeners
    document.addEventListener('touchstart', onTouchStart, { passive: false });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
    document.addEventListener('touchcancel', onTouchCancel);
    
    // Cleanup function
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', onTouchCancel);
    };
  }, []);
  
  // Placeholder for unimplemented methods to avoid errors
  const onTouchStart = () => {}; 
  const onTouchMove = () => {};
  const onTouchEnd = () => {};
  const onTouchCancel = () => {};
  
  return null;
};

export default TouchDragHandler; 