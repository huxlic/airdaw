import {useEffect, useRef} from "react";
import {FilesetResolver, HandLandmarker, type HandLandmarkerResult} from "@mediapipe/tasks-vision";

type OnFrame = (
	detections: HandLandmarkerResult,
	video: HTMLVideoElement,
	canvas: HTMLCanvasElement
) => void;

const useHandTracking = (onFrame: OnFrame) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const handLandmarkerRef = useRef<HandLandmarker | null>(null);
	const onFrameRef = useRef(onFrame);
	onFrameRef.current = onFrame;
	
	useEffect(() => {
		let animationId: number;
		
		const setup = async (): Promise<void> => {
			// eslint-disable-next-line no-useless-catch
			try {
				const stream:MediaStream = await navigator.mediaDevices.getUserMedia({video: true});
				
				const video = videoRef.current;
				if (!video) return;
				video.srcObject = stream;
				
				const vision = await FilesetResolver.forVisionTasks("/mediapipe-wasm/wasm");
				handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
					baseOptions: {
						// https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task
						modelAssetPath: "/hand_landmarker.task",
						delegate: "GPU"
					}, numHands: 1,
					runningMode: "VIDEO"
				})
				
				predictLoop();
			} catch (e) {
				throw e;
			}
		}
		
		function predictLoop ():void {
			const video = videoRef.current;
			const canvas = canvasRef.current;
			const handLandmarker = handLandmarkerRef.current
			
			if (!video || !canvas || !handLandmarker) {
				animationId = requestAnimationFrame(predictLoop);
				return;
			}
			
			const dpr = window.devicePixelRatio;
			if (canvas.width !== video.videoWidth * dpr) {
				canvas.width = video.videoWidth * dpr;
				canvas.height = video.videoHeight * dpr;
				
				const ctx = canvas.getContext('2d');
				ctx?.scale(dpr, dpr);
			}
			
			const detections: HandLandmarkerResult = handLandmarker.detectForVideo(video, performance.now());
			onFrameRef.current(detections, video, canvas);
			animationId = requestAnimationFrame(predictLoop);
		}
		setup();
		
		return () => {
			cancelAnimationFrame(animationId);
			handLandmarkerRef.current?.close();
		}
	}, [])
	
	return {videoRef, canvasRef}
}

export default useHandTracking;