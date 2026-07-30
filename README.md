# AirDAW

AirDAW is a browser-based, gesture-controlled mini-DAW built with React + Vite. It uses MediaPipe Hand Landmarker to track hand landmarks and Tone.js to synthesize audio in real time — pinch your thumb and index finger to trigger chords and control filter with vertical motion.

Key features

- Real-time hand tracking using MediaPipe Hand Landmarker
- Audio synthesis and effects using Tone.js (polyphonic synth, reverb, delay, filter)
- Simple single-page UI: click "Enter the stage" to enable audio and camera

Quick start

Prerequisites: Node.js (18+) and npm

1. Install dependencies

   npm install

2. Run development server

   npm run dev

3. Open http://localhost:5173

Usage

- Click "Enter the stage" to grant camera and audio permission.
- The app listens for a pinch (thumb ↔ index). When pinching, a chord is triggered. Vertical position controls the filter frequency.

Project structure (important files)

- src/AirDAW.tsx — main component that wires camera, canvas and audio
- src/hooks/useHandTracking.ts — MediaPipe setup and video loop
- src/utils/processHandAudio.ts — maps landmarks to Tone.js synth and effects
- public/hand_landmarker.task and public/mediapipe-wasm — runtime assets required by MediaPipe (served from /)

Scripts (from package.json)

- npm run dev — start Vite dev server
- npm run build — build production assets (runs tsc -b && vite build)
- npm run lint — run ESLint
- npm run preview — preview built site

Notes

- MediaPipe files in public/ must be served at the root (the app expects /hand_landmarker.task and /mediapipe-wasm).
- Audio playback requires a user gesture to unlock the Web Audio API — use the "Enter the stage" button.

Contributing

Issues and PRs welcome. Keep changes small and focused.

License

MIT
