
import useHandTracking from "./hooks/useHandTracking.ts";
import drawHandSkeleton from "./utils/drawHandSkeleton.ts";

export const AirDAW = () => {
    const {videoRef, canvasRef} = useHandTracking((detections, video, canvas) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(10, 10, 15, 0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (detections.landmarks.length > 0) {
            const hand = detections.landmarks[0];
            drawHandSkeleton(ctx, hand, video.videoWidth, video.videoHeight);
            
            // const thumbTip = hand[4];
            // const indexTip = hand[8];
            // console.log(thumbTip, indexTip);
            
        }
    })
    return (
        <div className={"relative w-screen h-screen"}>
            <video autoPlay playsInline ref={videoRef} className={"absolute inset-0 w-full h-full object-cover -scale-x-100"} ></video>
            <canvas ref={canvasRef} className={"absolute inset-0 w-full h-full object-cover"} ></canvas>
        </div>
    );
};