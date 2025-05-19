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
    imageClone.src = imageUrl;
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
    
    let imageId, imageUrl, sourceIndex = null;
    
    if (galleryItem) {
      // Dragging from gallery
      imageId = galleryItem.getAttribute('data-image-id');
      if (!imageId) return;
      
      const img = galleryItem.querySelector('img');
      if (!img || !img.src) return;
      
      imageUrl = img.src;
    } 
    else if (dropContent) {
      // Dragging from a drop zone
      const img = dropContent.querySelector('img');
      if (!img || !img.src) return;
      
      imageUrl = img.src;
      imageId = img.getAttribute('data-id') || '0'; // Fallback ID
      
      // Get the source index from the drop-item or drop-content
      const dropItem = dropContent.closest('.drop-item');
      if (dropItem && dropItem.hasAttribute('data-index')) {
        sourceIndex = parseInt(dropItem.getAttribute('data-index'), 10);
      } else if (dropContent.hasAttribute('data-parent-index')) {
        sourceIndex = parseInt(dropContent.getAttribute('data-parent-index'), 10);
      }
      
      console.log('Dragging from drop zone with index:', sourceIndex);
    }
    else {
      // Not a draggable element
      console.log('Not a draggable element');
      return;
    }
    
    // Set the dragged item data
    setDraggedItem({
      id: parseInt(imageId, 10),
      url: imageUrl,
      sourceIndex: sourceIndex
    });
    
    console.log('Dragged item set to:', {
      id: parseInt(imageId, 10),
      url: imageUrl,
      sourceIndex: sourceIndex
    });
    
    // Create the visual dragged element
    const clone = createDragClone(element, touch.clientX, touch.clientY, imageUrl);
    setDraggedElement(clone);
    isDraggingRef.current = true;
    
    // Add drag-over class to any drop zone we're over
    const dropTarget = getDropTarget(touch.clientX, touch.clientY);
    if (dropTarget) {
      const dropContent = dropTarget.element.querySelector('.drop-content');
      if (dropContent) {
        dropContent.classList.add('drag-over');
        setLastDropTarget(dropTarget);
      }
    }
  };
  
  // Calculate distance between two points
  const getDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };
  
  useEffect(() => {
    // When component mounts, add data-index attributes to all drop items for easier identification
    const addIndices = () => {
      const dropItems = document.querySelectorAll('.drop-item');
      dropItems.forEach((item, idx) => {
        if (!item.hasAttribute('data-index')) {
          item.setAttribute('data-index', idx);
        }
      });
    };
    
    // Run immediately and after a short delay (in case DOM isn't ready yet)
    addIndices();
    setTimeout(addIndices, 500);
    
    const onTouchStart = (e) => {
      // If in edit mode, don't start drag operations
      const mainContent = document.querySelector('.main-content');
      if (mainContent && mainContent.classList.contains('edit-mode')) {
        console.log('In edit mode, ignoring drag attempt');
        return;
      }
      
      // Find the closest draggable element (either gallery item or drop content)
      const target = e.target;
      console.log('Touch target:', target.tagName, target.className);
      
      const galleryItem = target.closest('.gallery-item');
      const dropContentWithImage = target.closest('.drop-content.has-image');
      
      console.log('Touch detected on:', { 
        isGalleryItem: !!galleryItem, 
        isDropContent: !!dropContentWithImage,
        targetTag: target.tagName,
        targetClass: target.className
      });
      
      // Only proceed if touching a draggable element
      if (!galleryItem && !dropContentWithImage) return;
      
      // Don't prevent default here - allow scrolling to start
      
      if (e.touches.length !== 1) return; // Only handle single touches
      
      // Store the initial touch position
      const touch = e.touches[0];
      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
      
      // Set a timer for starting the drag (shorter delay for better responsiveness)
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = setTimeout(() => {
        if (!isDraggingRef.current) {
          // Start drag with either gallery item or drop content
          const element = galleryItem || dropContentWithImage;
          if (element) {
            console.log('Starting drag from element:', element.className);
            startDragOperation(element, touch);
          }
        }
      }, 200); // Reduced from 300ms to 200ms for better responsiveness
    };
    
    const onTouchMove = (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      
      // If we're already dragging, handle the drag movement
      if (isDraggingRef.current && draggedElement) {
        // Prevent scrolling when actively dragging
        e.preventDefault();
        e.stopPropagation();
        moveClone(draggedElement, touch.clientX, touch.clientY);
        
        // Check if we're over a drop target using the finger position
        const dropTarget = getDropTarget(touch.clientX, touch.clientY);
        
        // Remove drag-over from previous target if we've moved to a new one
        if (lastDropTarget && (!dropTarget || dropTarget.index !== lastDropTarget.index)) {
          const lastDropContent = lastDropTarget.element.querySelector('.drop-content');
          if (lastDropContent) {
            lastDropContent.classList.remove('drag-over');
          }
        }
        
        // Add drag-over to the new target
        if (dropTarget) {
          const dropContent = dropTarget.element.querySelector('.drop-content');
          if (dropContent) {
            dropContent.classList.add('drag-over');
            setLastDropTarget(dropTarget);
          }
        } else {
          setLastDropTarget(null);
        }
        return;
      }
      
      // If we're not dragging yet, check if we've moved enough to cancel the timer
      // (this allows scrolling to work normally unless we hold in place)
      const distanceMoved = getDistance(
        touchStartPosRef.current.x, 
        touchStartPosRef.current.y,
        touch.clientX,
        touch.clientY
      );
      
      // If moved more than 10px before the timer fires, cancel the drag start
      if (distanceMoved > 10 && touchTimerRef.current) {
        clearTimeout(touchTimerRef.current);
        touchTimerRef.current = null;
      }
    };
    
    const onTouchEnd = (e) => {
      // Cancel any pending drag start
      clearTimeout(touchTimerRef.current);
      
      // If we're not in a drag operation, don't do anything
      if (!isDraggingRef.current || !draggedElement || !draggedItem) return;
      
      // Prevent default only if we're in a drag operation
      e.preventDefault();
      
      // Check if touch ends over a drop target
      let x, y;
      if (e.changedTouches && e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        x = touch.clientX;
        y = touch.clientY;
      } else {
        // Use last known position if no touch info available
        x = fingerPosition.x;
        y = fingerPosition.y;
      }
      
      // Get the drop target at the end position
      const dropTarget = getDropTarget(x, y);
      console.log('Drop target at touch end:', dropTarget);
      
      // Don't allow dropping onto the source location (no-op)
      if (dropTarget && dropTarget.index === draggedItem.sourceIndex) {
        console.log('Dropping on the source location, ignoring');
      }
      // Call the app's drop handler if we found a target
      else if (dropTarget && window.reactAppInstance && window.reactAppInstance.handleDrop) {
        console.log('Calling handleDrop with index:', dropTarget.index);
        window.reactAppInstance.handleDrop(draggedItem, dropTarget.index);
      } else {
        console.log('No valid drop target found or handleDrop not available');
      }
      
      // Clean up
      if (lastDropTarget) {
        const lastDropContent = lastDropTarget.element.querySelector('.drop-content');
        if (lastDropContent) {
          lastDropContent.classList.remove('drag-over');
        }
      }
      
      // Clean up the visual elements
      removeDragClone(draggedElement);
      setDraggedElement(null);
      setDraggedItem(null);
      setLastDropTarget(null);
      isDraggingRef.current = false;
    };
    
    const onTouchCancel = (e) => {
      // Cancel any pending drag start
      clearTimeout(touchTimerRef.current);
      
      // If we're not in a drag operation, don't do anything
      if (!isDraggingRef.current) return;
      
      // Prevent default only if we're in a drag operation
      e.preventDefault();
      
      // Clean up without dropping
      if (lastDropTarget) {
        const dropContent = lastDropTarget.element.querySelector('.drop-content');
        if (dropContent) {
          dropContent.classList.remove('drag-over');
        }
      }
      
      // Clean up the visual elements
      removeDragClone(draggedElement);
      setDraggedElement(null);
      setDraggedItem(null);
      setLastDropTarget(null);
      isDraggingRef.current = false;
    };
    
    // Add event listeners
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd, { passive: false });
    document.addEventListener('touchcancel', onTouchCancel, { passive: false });
    
    return () => {
      // Clean up event listeners
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', onTouchCancel);
      
      // Clear any pending timers
      clearTimeout(touchTimerRef.current);
    };
  }, [draggedElement, draggedItem, lastDropTarget, touchOffsetX, touchOffsetY, fingerPosition]);
  
  // This is a non-visible component that just manages events
  return null;
};

export default TouchDragHandler; 