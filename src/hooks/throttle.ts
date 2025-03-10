import { useEffect, useRef, useState } from "react";

/**
 *
 * @param value
 * @param delay
 */
export const useThrottleValue = <T>(
	value: T,
	delay: number,
	immediate = true,
) => {
	const [throttledValue, setThrottledValue] = useState<T | null>(() =>
		immediate ? value : null,
	);

	console.log(throttledValue);
	// to store last execution time
	const lastExecutedRef = useRef(0);
	// to store the most recent value
	const latestValueRef = useRef<T>(value);

	useEffect(() => {
		if (lastExecutedRef.current !== value) {
			latestValueRef.current = value;
		}

		const isNotImmediateFirstRun = !immediate && lastExecutedRef.current === 0;

		const lastRunTime = isNotImmediateFirstRun
			? Date.now()
			: lastExecutedRef.current;

		const timeElapsed = Date.now() - lastRunTime;

		let timeoutHandle: null | number;

		const updateThrottledValue = () => {
			setThrottledValue(latestValueRef.current);
			lastExecutedRef.current = Date.now();
		};

		if (timeElapsed >= delay) {
			updateThrottledValue();
		} else {
			const remainingDelay = delay - timeElapsed;
			timeoutHandle = setTimeout(updateThrottledValue, remainingDelay);
		}

		return () => {
			if (timeoutHandle) clearTimeout(timeoutHandle);
		};
	}, [value, delay, immediate]);

	return throttledValue;
};
