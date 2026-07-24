import {useEffect, useRef} from "react";
import {FilesetResolver, HandLandmarker, type HandLandmarkerResult} from "@mediapipe/tasks-vision";

export const AirDAW = () => {

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const handLandmarkerRef = useRef<HandLandmarker | null>(null)

    useEffect(() => {
        let animationId: number;
        
        const setup: () => Promise<void> = async () => {
            // eslint-disable-next-line no-useless-catch
            try {
                const stream:MediaStream = await navigator.mediaDevices.getUserMedia({video: true});
                
                const video = videoRef.current;
                if (!video) return;
                video.srcObject = stream;
                
                const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
                handLandmarkerRef.current = await HandLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task"
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
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const detections: HandLandmarkerResult = handLandmarker.detectForVideo(video, performance.now());
            processResults(detections, canvas);
            animationId = requestAnimationFrame(predictLoop);
        }
        
        function processResults(detections: HandLandmarkerResult, canvas: HTMLCanvasElement): void {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(10, 10, 15, 0.6)';
            ctx.fillRect(0,0,canvas.width,canvas.height)
            
            if (detections.landmarks.length > 0) {
                const hand = detections.landmarks[0];
                
                // Draw connections first, so dots sit on top of the lines
                ctx.strokeStyle = '#F2C879';
                ctx.lineWidth = .5;
                ctx.shadowColor = "#df981d";
                ctx.shadowBlur = 30;
                
                for (const connection of HandLandmarker.HAND_CONNECTIONS) {
                    const start = hand[connection.start];
                    const end = hand[connection.end];
                    
                    const startX = (1 - start.x) * canvas.width;
                    const startY = start.y * canvas.height;
                    const endX = (1 - end.x) * canvas.width;
                    const endY = end.y * canvas.height;
                    
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                }
                
                // Then draw the dots on top
                for (const point of hand) {
                    const x = (1 - point.x) * canvas.width;
                    const y = point.y * canvas.height;
                    
                    ctx.beginPath();
                    ctx.arc(x, y, 2, 0, 2 * Math.PI);
                    ctx.fillStyle = '#F2C879';
                    ctx.fill();
                }
            }
        }
        setup();
        
        return () => {
            cancelAnimationFrame(animationId);
            handLandmarkerRef.current?.close();
        }
    }, [])

    return (
        <div className={"relative w-screen h-screen bg-amber-500"}>
            <video autoPlay playsInline ref={videoRef} className={"absolute inset-0 w-full h-full object-cover -scale-x-100"} ></video>
            <canvas ref={canvasRef} className={"absolute inset-0 w-full h-full object-cover"} ></canvas>
        </div>
    );
};