import { describe, test, expect, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useThrottleValue } from "../hooks/throttle";

describe("tests for throttle.ts", () => {
	describe("tests for useThrottleValue", () => {
		afterEach(() => {
			vi.clearAllTimers();
		});

		test("it should return initial value as null if immediate=false is sent", () => {
			const { result } = renderHook(
				({ value, delay, immediate }) =>
					useThrottleValue(value, delay, immediate),
				{
					initialProps: {
						value: "init",
						delay: 500,
						immediate: false,
					},
				},
			);

			expect(result.current).toBe(null);
		});

		test("it should throttle and return the most recent value after the delay", () => {
			const { result, rerender } = renderHook(
				({ value, delay }) => useThrottleValue(value, delay),
				{
					initialProps: {
						value: "init",
						delay: 500,
					},
				},
			);

			// expect(result.current).toBe("init");

			act(() => {
				rerender({ value: "state1", delay: 500 });
			});

			act(() => {
				vi.advanceTimersByTime(400);
			});

			expect(result.current).toBe("init");

			act(() => {
				rerender({ value: "state2", delay: 500 });
			});

			act(() => {
				vi.advanceTimersByTime(100);
			});

			expect(result.current).toBe("state2");
		});
	});

	// describe("tests for useThrottleFn", () => {});
});
