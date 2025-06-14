# 3D Railway Simulator

A web-based 3D railway simulator built with Three.js that allows users to drive trains and build railway networks in an immersive 3D environment.

## Features

### 🚂 Train Simulation
- Realistic train physics with acceleration, deceleration, and resistance
- Speed control with keyboard and UI controls
- Emergency braking system
- Distance tracking and speedometer display
- Multiple train cars (locomotive + passenger cars)

### 🛤️ Track System
- Straight and curved track segments
- Interactive track building tool
- Railway signals with automatic braking
- Station placement along tracks
- Dynamic track network expansion

### 🎮 Dual Mode Experience
- **Drive Mode**: Control the train and experience realistic railway operation
- **Build Mode**: Design and construct your own railway network

### 🌍 3D Environment
- Immersive 3D terrain with mountains, trees, and rocks
- Realistic lighting and shadows
- Weather effects with sky simulation
- First-person and third-person camera views

## Controls

### Drive Mode
- **Arrow Up/Down**: Increase/decrease train speed
- **Spacebar**: Emergency brake
- **V**: Toggle between first-person and third-person view
- **Speed Slider**: Precise speed control (0-100 km/h)
- **Start/Stop Buttons**: Begin or end train operation

### Build Mode
- **Click**: Place track segments, stations, or signals
- **R**: Toggle between straight and curved track types
- **ESC**: Cancel current building action
- **Delete/Backspace**: Remove selected objects
- **Build Tools**: 
  - Add Track button
  - Add Station button  
  - Add Signal button
  - Delete button

## Getting Started

1. **Open the simulator**: Open `index.html` in a modern web browser
2. **Choose your mode**: 
   - Click "Drive Mode" to operate trains
   - Click "Build Mode" to construct railway networks
3. **Start driving**: Use the speed controls and keyboard to operate your train
4. **Build railways**: Place tracks, stations, and signals to expand your network

## Technical Features

### Physics Engine
- Realistic train physics including:
  - Mass-based acceleration and deceleration
  - Rolling resistance and air resistance
  - Emergency braking systems
  - Speed-dependent wheel rotation

### 3D Graphics
- Built with Three.js WebGL renderer
- Real-time shadows and lighting
- Detailed 3D models for trains, tracks, stations, and signals
- Procedurally generated terrain with environmental objects

### Track System
- Modular track segment system
- Support for straight and curved sections
- Automatic train path following
- Signal-based traffic control
- Station waypoint system

## File Structure

```
trainsim/
├── index.html              # Main HTML file
├── css/
│   └── style.css          # Stylesheet
├── js/
│   ├── game.js            # Main game logic and initialization
│   ├── train.js           # Train physics and behavior
│   ├── track.js           # Track system and railway logic
│   ├── builder.js         # Interactive track building tools
│   └── 3d/
│       ├── scene.js       # 3D scene management
│       ├── models.js      # 3D model definitions
│       └── terrain.js     # Terrain and environment generation
```

## Browser Requirements

- Modern web browser with WebGL support
- JavaScript enabled
- Recommended: Chrome, Firefox, Safari, or Edge (latest versions)

## Development

The project is built using vanilla JavaScript and Three.js. Key components:

- **Scene3D**: Manages the 3D rendering, camera, and controls
- **Train**: Handles train physics, movement, and visual representation
- **Track**: Manages railway infrastructure and pathfinding
- **TrackBuilder**: Provides interactive tools for railway construction
- **Models**: Contains 3D model definitions for all game objects
- **Terrain**: Generates the 3D environment and landscape

## Future Enhancements

Potential areas for expansion:
- Multiple trains on the same track network
- Advanced signaling systems with automatic train control
- Save/load functionality for custom railway networks
- Multiplayer support
- Additional train types and cargo systems
- Weather effects and day/night cycles
- Sound effects and ambient audio

## License

This project is open source. Feel free to modify and distribute according to your needs.

---

**Enjoy building and operating your virtual railway empire!** 🚂
