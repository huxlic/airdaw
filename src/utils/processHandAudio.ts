import * as Tone from 'tone';
import type {NormalizedLandmark} from "@mediapipe/tasks-vision";
import mapRange from "./mapRange.ts";
let synth: Tone.PolySynth  | null = null;
let filter: Tone.Filter | null = null;
let isPinching = false;
let activeChord: number[] = []

const scale = [
	130.81, 146.83, 164.81, 196.00, 220.00, // C3 D3 E3 G3 A3
	261.63, 293.66, 329.63, 392.00, 440.00, // C4 D4 E4 G4 A4
	523.25 // C5
];

export const initAudio = async () => {
	await Tone.start();
	
	const reverb = new Tone.Reverb({ decay: 3.5, wet: 0.45 }).toDestination();
	await reverb.ready;
	
	// The echo effect: repeats each note, fading out, bouncing left-right
	const delay = new Tone.PingPongDelay("8n", 0.3).connect(reverb);
	delay.wet.value = 0.35;
	
	const chorus = new Tone.Chorus(4, 2.5, 0.5).connect(delay);
	const vibrato = new Tone.Vibrato(5, 0.15).connect(chorus);
	
	filter = new Tone.Filter(150, "highpass", -12).connect(vibrato);
	
	synth = new Tone.PolySynth(Tone.Synth, {
		oscillator: { type: "sine" },
		envelope: { attack: 0.15, decay: 0.3, sustain: 0.7, release: 0.8 }
	}).connect(filter);
}

const processHandAudio = (hand: NormalizedLandmark[]) => {
	if (!synth || !filter) return;
	
	const thumbTip = hand[4];
	const indexTip = hand[8];
	
	const midX = (thumbTip.x + indexTip.x) / 2;
	const midY = (thumbTip.y + indexTip.y) / 2;
	
	const dx = thumbTip.x - indexTip.x;
	const dy = thumbTip.y - indexTip.y;
	const distance = Math.hypot(dx, dy);
	
	// const index = Math.floor(mapRange(midX, 0, 1, 0, scale.length - 1));
	
	// const chord = [
	// 	scale[index],
	// 	scale[Math.min(index + 2, scale.length - 1)],
	// 	scale[Math.min(index + 4, scale.length - 1)]
	// ];
	
	const filterFreq = mapRange(midY, 0, 1, 3000, 300);
	filter.frequency.rampTo(filterFreq, 0.1);
	
	const pinchThreshold = 0.05;
	
	if (distance < pinchThreshold && !isPinching) {
		isPinching = true;
		const index = Math.floor(mapRange(midX, 0, 1, 0, scale.length - 1));
		activeChord = [
			scale[index],
			scale[Math.min(index + 2, scale.length - 1)],
			scale[Math.min(index + 4, scale.length - 1)]
		];
		synth.triggerAttack(activeChord);
	} else if (distance >= pinchThreshold && isPinching) {
		isPinching = false;
		synth.triggerRelease(activeChord);
	}
}

export default processHandAudio;