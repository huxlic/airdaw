import { HandLandmarker, type NormalizedLandmark } from '@mediapipe/tasks-vision';

const drawHandSkeleton = (
	ctx: CanvasRenderingContext2D,
	hand: NormalizedLandmark[],
	videoWidth: number,
	videoHeight: number
): void => {
	const skeletonPath = new Path2D();
	
	for (const connection of HandLandmarker.HAND_CONNECTIONS) {
		const start = hand[connection.start];
		const end = hand[connection.end];
		
		const startX = (1 - start.x) * videoWidth;
		const startY = start.y * videoHeight;
		const endX = (1 - end.x) * videoWidth;
		const endY = end.y * videoHeight;
		
		skeletonPath.moveTo(startX, startY);
		skeletonPath.lineTo(endX, endY);
	}
	
	ctx.strokeStyle = '#F2C879';
	ctx.lineWidth = 0.5;
	ctx.shadowColor = '#df981d';
	ctx.shadowBlur = 30;
	ctx.stroke(skeletonPath);
	
	ctx.shadowBlur = 0;
	
	for (const point of hand) {
		const x = (1 - point.x) * videoWidth;
		const y = point.y * videoHeight;
		
		ctx.beginPath();
		ctx.arc(x, y, 2, 0, 2 * Math.PI);
		ctx.fillStyle = '#F2C879';
		ctx.fill();
	}
}

export default drawHandSkeleton;