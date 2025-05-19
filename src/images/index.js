// Import all available car control icons
import assistant from './Assistant.png';
import appleMusic from './Apple Music.png';
import camera from './Camera.png';
import cruiseControl from './Cruise Control.png';
import petMode from './Pet Mode.png';
import memoryPosition from './Memory Position.png';
import drivingModes from './Driving Modes.png';
import emergency from './Emergency.png';
import fanSpeed from './Fan Speed.png';
import selfDriving from './Self-Driving.png';
import home from './Home.png';
import work from './Work.png';
import navigation from './Navigation.png';
import leftIndicator from './Left Indictor.png';
import rightIndicator from './Right Indictor.png';
import foldMirrors from './Fold Mirrors.png';
import lightModes from './Light Modes.png';
import passengerLock from './Passenger Lock.png';
import sunRoof from './Sun Roof.png';
import radio from './Radio.png';
import heatedSeats from './Heated Seats.png';
import temperature from './Temperature.png';
import speechControl from './Speech Control.png';
import wiperSpeed from './Wiper Speed.png';
import interiorLights from './Interior Lights.png';
import phone from './Phone.png';

// Define the categories and their items
export const galleryCategories = [
  {
    name: "Media & Entertainment",
    items: [
      { id: 1, url: assistant, alt: 'Assistant' },
      { id: 2, url: appleMusic, alt: 'Apple Music' },
      { id: 3, url: navigation, alt: 'Navigation' },
      { id: 4, url: radio, alt: 'Radio' },
      { id: 5, url: phone, alt: 'Phone' },
      { id: 6, url: speechControl, alt: 'Speech Control' }
    ]
  },
  {
    name: "Vehicle Controls",
    items: [
      { id: 7, url: camera, alt: 'Camera' },
      { id: 8, url: passengerLock, alt: 'Passenger Lock' },
      { id: 9, url: cruiseControl, alt: 'Cruise Control' },
      { id: 10, url: petMode, alt: 'Pet Mode' },
      { id: 11, url: drivingModes, alt: 'Driving Modes' },
      { id: 12, url: emergency, alt: 'Emergency' },
      { id: 13, url: fanSpeed, alt: 'Fan Speed' },
      { id: 14, url: selfDriving, alt: 'Self-Driving' },
      { id: 15, url: leftIndicator, alt: 'Left Indicator' },
      { id: 16, url: rightIndicator, alt: 'Right Indicator' },
      { id: 17, url: lightModes, alt: 'Light Modes' },
      { id: 18, url: temperature, alt: 'Temperature' },
      { id: 19, url: wiperSpeed, alt: 'Wiper Speed' }
    ]
  },
  {
    name: "Comfort & Convenience",
    items: [
      { id: 20, url: memoryPosition, alt: 'Memory Position' },
      { id: 21, url: foldMirrors, alt: 'Fold Mirrors' },
      { id: 22, url: sunRoof, alt: 'Sun Roof' },
      { id: 23, url: heatedSeats, alt: 'Heated Seats' },
      { id: 24, url: interiorLights, alt: 'Interior Lights' },
      { id: 25, url: home, alt: 'Home' },
      { id: 26, url: work, alt: 'Work' }
    ]
  }
];

// Keep the flat list for backward compatibility
export const galleryImages = galleryCategories.flatMap(category => category.items); 