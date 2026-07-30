const mapRange = (
	value: number,
	inMin: number,
	inMax: number,
	outMin: number,
	outMax: number
): number => {
	const t = (value - inMin) / (inMax - inMin);
	return outMin + t * (outMax - outMin);
}

export default mapRange;