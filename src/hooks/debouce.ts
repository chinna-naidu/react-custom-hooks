import { useCallback, useEffect, useRef, useState } from "react";

export const useDebounceValue = <T>(value: T, ms: number) => {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const timeoutHandle = setTimeout(() => {
			setDebouncedValue(value);
		}, ms);

		return () => clearTimeout(timeoutHandle);
	}, [value, ms]);

	return debouncedValue;
};

interface UseDebounceFnConfig {
	leading?: boolean;
	trailing?: boolean;
	maxDealy?: number;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const useDebounceFn = <T extends (...args: any[]) => any>(
	fn: T,
	delay: number,
	config: UseDebounceFnConfig = {},
) => {
	const timeOutRef = useRef<number | null>(null);
	const maxTimeOutRef = useRef<number | null>(null);
	const lastFnCalledRef = useRef<number | null>(null);
	const fnRef = useRef(fn);

	const { leading, trailing, maxDealy } = config;

	useEffect(() => {
		fnRef.current = fn;
	}, [fn]);

	useEffect(() => {
		if (timeOutRef.current !== null) clearTimeout(timeOutRef.current);
		if (maxTimeOutRef.current !== null) clearTimeout(maxTimeOutRef.current);
	}, []);

	const debouncedFn = useCallback(
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		(...args: any[]) => {
			// checking if this is is the first call for leading execution
			const isFirstCall = lastFnCalledRef.current === null;
			console.log("isFirstCall", isFirstCall);

			const isLeading = isFirstCall && leading;

			console.log("isLeading", isLeading);

			const callFn = () => {
				timeOutRef.current = null;
				maxTimeOutRef.current = null;
				lastFnCalledRef.current = Date.now();
				fnRef.current(...args);
			};

			// if leading then calling the fn and returning
			if (isLeading) {
				callFn();
				return;
			}

			// if there is already a time running clear it
			if (timeOutRef.current) clearTimeout(timeOutRef.current);

			// set max delay timer only if it is configured
			if (maxDealy && !maxTimeOutRef.current && trailing) {
				maxTimeOutRef.current = setTimeout(callFn, maxDealy);
			}

			// setting normal timer
			timeOutRef.current = setTimeout(callFn, delay);
		},
		[leading, trailing, maxDealy, delay],
	);

	const cancel = useCallback(() => {
		if (timeOutRef.current !== null) clearTimeout(timeOutRef.current);
		if (maxTimeOutRef.current !== null) clearTimeout(maxTimeOutRef.current);
	}, []);

	return [debouncedFn, cancel];
};
