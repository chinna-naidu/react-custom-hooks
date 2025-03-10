import { useRef } from "react";

type EffectFn = () => () => void;

const isDepsChanged = <T>(currentDeps: T[], prevDeps: T[]) => {
	if (currentDeps.length !== prevDeps.length) {
		return true;
	}

	for (let i = 0; i < currentDeps.length; i++) {
		if (currentDeps[i] !== prevDeps[i]) {
			return false;
		}
	}

	return true;
};

export const useCustomEffect = <T>(effect: EffectFn, dependencies: T[]) => {
	const isFirstRender = useRef(true);
	const effectFnRef = useRef(effect);
	const cleanUpRef = useRef(() => {});

	const prevDepsRef = useRef<T[]>([]);

	if (
		isFirstRender.current ||
		isDepsChanged(dependencies, prevDepsRef.current)
	) {
		// run clean up
		cleanUpRef.current();
		// runnning the effect
		cleanUpRef.current = effectFnRef.current();
		// setting first render as false
		isFirstRender.current = false;
	}

	// setting prev deps
	prevDepsRef.current = dependencies;
};
