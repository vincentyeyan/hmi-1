import React, { useState } from 'react';
import buttonControls from '../images/icons/Button Controls.png';
import charge from '../images/icons/Charge.png';
import display from '../images/icons/Display.png';
import myCar from '../images/icons/My Car.png';
import shape from '../images/icons/Shape.png';
import steeringAndPedals from '../images/icons/Steering and Pedals.png';

function Sidebar({ onESPClick }) {
  const [activeIcon, setActiveIcon] = useState('buttonControls'); // Default to button controls
  
  const icons = [
    { id: 'myCar', src: myCar, alt: 'My Car', selectable: false },
    { id: 'shape', src: shape, alt: 'Shape', selectable: false },
    { id: 'charge', src: charge, alt: 'Charge', selectable: false },
    { id: 'display', src: display, alt: 'Display', selectable: false },
    { id: 'steeringAndPedals', src: steeringAndPedals, alt: 'Steering and Pedals', selectable: false },
    { id: 'buttonControls', src: buttonControls, alt: 'Button Controls', selectable: true }
  ];

  const handleIconClick = (id, selectable) => {
    // Only update active state if the icon is selectable
    if (selectable) {
      setActiveIcon(id);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-icons">
        {icons.map(icon => (
          <div 
            key={icon.id} 
            className={`sidebar-icon ${activeIcon === icon.id ? 'active' : ''} ${icon.selectable ? 'selectable' : 'non-selectable'}`}
            onClick={() => handleIconClick(icon.id, icon.selectable)}
          >
            <img src={icon.src} alt={icon.alt} />
          </div>
        ))}
        
        {/* ESP32 Settings Button */}
        <div 
          className="esp-button"
          onClick={onESPClick}
          style={{
            marginTop: '10px'
          }}
        >
          ESP
        </div>
      </div>
    </div>
  );
}

export default Sidebar; 