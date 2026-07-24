import * as Tone from 'tone';
import type {NormalizedLandmark} from "@mediapipe/tasks-vision";
import mapRange from "./mapRange.ts";
let synth: Tone.Synth | null = null;
let filter: Tone.Filter | null = null;
let isPinching = false;

export const initAudio = async () => {
	await Tone.start();
	filter = new Tone.Filter(350, "highpass", -12).toDestination();
	synth = new Tone.Synth().connect(filter);
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