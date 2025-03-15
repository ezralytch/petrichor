# Petrichor Project Plan

## Project Overview
Petrichor is a generative meditation app producing evolving polyrhythmic patterns using rain drums and simple atmospheric modular synths. Each session creates a unique, gradually evolving soundscape within user-defined parameters, built as a React Vite application.

## Core Components

### 1. Audio Engine
- **Foundation**: Web Audio API for all sound generation
- **Architecture**: Modular system with separate synth and percussion engines
- **Base Elements**: Oscillator and filter nodes, gain controllers, effects chain

### 2. Synth Module
- **Purpose**: Generate atmospheric modular synth sounds
- **Implementation**: Node-based system with oscillators, filters, and modulators
- **Algorithm**: Generate chord progressions in user-selected key
- **Evolution**: Slow parameter changes over time using LFOs and probability distributions

### 3. Percussion Module
- **Purpose**: Create polyrhythmic rain drum patterns
- **Sound Design**: Filtered noise and resonant filters for rain drum sounds
- **Generation**: Mathematical ratios and modulo operations for rhythm creation
- **Evolution**: Subtle randomization within rhythmic constraints

### 4. UI/UX 
- **Framework**: React/Vite interface
- **Style**: Clean, minimal meditation-focused design
- **Controls**: Duration selection, key selection, intensity controls
- **Features**: Save/load favorite configurations, visual feedback

### 5. Generation Algorithm
- **Approach**: Probability-weighted note selection within scales
- **Parameters**: User-defined constraints (key, intensity, complexity)
- **Evolution**: Gradual changes in pattern density and harmonic content
- **Binaural**: Implementation of 432Hz binaural beats (optional)

## Technical Specifications

### Modular Synth Implementation
- **Oscillators**: Combination of triangle and sine waves
- **Filters**: Low-pass and band-pass with slow modulation
- **Modulation**: LFOs controlling filter cutoffs, oscillator detune
- **Harmony**: Note selection from scale arrays based on selected key
- **Evolution**: Iterative functions with controlled randomness

### Polyrhythm Implementation
- **Timing**: Modulo operations on timing loops for interlocking patterns
- **Mathematics**: Ratios derived from natural sequences (phi, pi)
- **Layers**: Multiple timing patterns with varying intensities
- **Sound**: Triangle wave oscillators with envelope shaping for rain drum sounds
- **Variation**: Subtle timing and velocity changes for organic feel

## User Workflow
1. User selects session duration
2. User selects musical key
3. User hits play
4. App initializes both modular synth and polyrhythmic rain drums
5. Soundscape evolves gradually over the selected duration
6. Optional: user can save the seed of a particularly enjoyable session

## Development Phases

### Phase 1: Prototype
- Basic Web Audio API implementation
- Simple React UI with core controls
- Proof of concept for both synth and percussion algorithms

### Phase 2: Core Features
- Complete implementation of synth module
- Complete implementation of percussion module
- Integration of generation algorithms
- Basic parameter controls

### Phase 3: Refinement
- UI polish and responsive design
- Parameter tuning for optimal meditation experience
- Performance optimization
- Additional sound design options

### Phase 4: Testing
- Cross-browser compatibility testing
- Mobile device optimization
- User experience testing
- Performance benchmarking

### Phase 5: Launch
- Deployment to hosting platform
- User feedback collection
- Analytics implementation
- Documentation completion

## Technical Considerations
- Web Audio API compatibility across browsers
- Mobile device performance limitations
- Audio latency management
- Memory usage optimization for long sessions
- Battery usage concerns for mobile meditation sessions

## Future Enhancements
- Visual component synchronized with audio
- Additional soundscape themes beyond rain
- Export functionality for generated sessions
- Social sharing of favorite configurations
- Progressive Web App implementation for offline use
