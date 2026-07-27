import * as Tone from 'tone';
import type {NormalizedLandmark} from "@mediapipe/tasks-vision";
import mapRange from "./mapRange.ts";
import {DuoSynth} from "tone";
let synth: DuoSynth | null = null;
let filter: Tone.Filter | null = null;
let isPinching = false;

export const initAudio = async () => {
	await Tone.start();
	
	const reverb = new Tone.Reverb({ decay: 2, wet: 0.3 }).toDestination();
	await reverb.ready;
	
	const chorus = new Tone.Chorus(4, 2.5, 0.5).connect(reverb);
	
	filter = new Tone.Filter(350, "lowpass", -12).connect(chorus);
	
	synth = new Tone.DuoSynth({
		portamento: 0.08,
		harmonicity: 1.005, // near-unison — the two voices beat gently against each other for thickness
		vibratoAmount: 0.3,
		vibratoRate: 5,
		voice0: {
			oscillator: { type: "triangle" },
			envelope: { attack: 0.05, decay: 0.2, sustain: 0.6, release: 0.4 }
		},
		voice1: {
			oscillator: { type: "triangle" },
			envelope: { attack: 0.05, decay: 0.2, sustain: 0.6, release: 0.4 }
		}
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
	
	const frequency = mapRange(midX, 0, 1, 100, 800);
	const filterFreq  = mapRange(midY, 0, 1, 4000, 200);
	
	synth.frequency.rampTo(frequency, 0.1);
	filter.frequency.rampTo(filterFreq, 0.1);
	
	const pinchThreshold = 0.05;
	
	if (distance < pinchThreshold && !isPinching) {
		isPinching = true;
		synth.triggerAttack(frequency);
	} else if (distance >= pinchThreshold && isPinching) {
		isPinching = false;
		synth.triggerRelease();
	}
}

export default processHandAudio;