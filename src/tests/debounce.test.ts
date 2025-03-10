import { describe, test, expect, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounceFn, useDebounceValue } from "../hooks/debouce";
import { aC } from "vitest/dist/chunks/reporters.QZ837uWx.js";

describe("tests for debounce.ts", () => {
	describe("tests for useDebounceValue", () => {
		afterEach(() => {
			vi.clearAllTimers();
		});

		test("should return initial value immediately", () => {
			const { result } = renderHook(() =>
				useDebounceValue("initial value", 500),
			);

			expect(result.current).toBe("initial value");
		});

		test("should not update debounced value before delay", () => {
			const { result, rerender } = renderHook(
				({ value, delay }) => useDebounceValue(value, delay),
				{ initialProps: { value: "initial value", delay: 500 } },
			);

			// Change the value
			rerender({ value: "updated value", delay: 500 });

			// Value shouldn't have changed yet
			expect(result.current).toBe("initial value");

			// Fast-forward time but not enough to trigger update
			act(() => {
				vi.advanceTimersByTime(400);
			});

			// Value still shouldn't have changed
			expect(result.current).toBe("initial value");
		});

		test("should update debounced value after delay", () => {
			const { result, rerender } = renderHook(
				({ value, delay }) => useDebounceValue(value, delay),
				{ initialProps: { value: "initial value", delay: 500 } },
			);

			// Change the value
			rerender({ value: "updated value", delay: 500 });

			// Fast-forward time past the delay
			act(() => {
				vi.advanceTimersByTime(600);
			});

			// Value should now be updated
			expect(result.current).toBe("updated value");
		});

		test("should reset the timer when value changes before delay", () => {
			const { result, rerender } = renderHook(
				({ value, delay }) => useDebounceValue(value, delay),
				{ initialProps: { value: "initial value", delay: 500 } },
			);

			// Change the value
			rerender({ value: "intermediate value", delay: 500 });

			// Fast-forward time but not enough to trigger update
			act(() => {
				vi.advanceTimersByTime(300);
			});

			// Value still shouldn't have changed
			expect(result.current).toBe("initial value");

			// Change the value again
			rerender({ value: "final value", delay: 500 });

			// Fast-forward time but still not enough for the second update
			act(() => {
				vi.advanceTimersByTime(300);
			});

			// Value still shouldn't have changed
			expect(result.current).toBe("initial value");

			// Fast-forward time enough to trigger the update from the second change
			act(() => {
				vi.advanceTimersByTime(200);
			});

			// Now we should see the final value
			expect(result.current).toBe("final value");
		});

		test("should handle delay changes", () => {
			const { result, rerender } = renderHook(
				({ value, delay }) => useDebounceValue(value, delay),
				{ initialProps: { value: "test value", delay: 500 } },
			);

			// Change only the delay
			rerender({ value: "test value", delay: 1000 });

			// Change the value
			rerender({ value: "updated value", delay: 1000 });

			// Fast-forward time past the original delay but before the new delay
			act(() => {
				vi.advanceTimersByTime(700);
			});

			// Value shouldn't have changed yet due to the longer delay
			expect(result.current).toBe("test value");

			// Fast-forward time past the new delay
			act(() => {
				vi.advanceTimersByTime(400);
			});

			// Now the value should be updated
			expect(result.current).toBe("updated value");
		});

		test("should handle different types of values", () => {
			// Test with a number
			const { result: numberResult, rerender: numberRerender } = renderHook(
				({ value, delay }) => useDebounceValue(value, delay),
				{ initialProps: { value: 0, delay: 500 } },
			);

			numberRerender({ value: 42, delay: 500 });

			act(() => {
				vi.advanceTimersByTime(600);
			});

			expect(numberResult.current).toBe(42);

			// Test with an object
			const { result: objectResult, rerender: objectRerender } = renderHook(
				({ value, delay }) => useDebounceValue(value, delay),
				{ initialProps: { value: { name: "initial" }, delay: 500 } },
			);

			const newObject = { name: "updated" };
			objectRerender({ value: newObject, delay: 500 });

			act(() => {
				vi.advanceTimersByTime(600);
			});

			expect(objectResult.current).toEqual(newObject);
		});
	});

	describe("tests for useDebounceFn", () => {
		afterEach(() => {
			vi.clearAllTimers();
		});

		test("it calls the function for the first time when leading is passed even when delay is not done", () => {
			const fn = vi.fn();

			const { result, rerender } = renderHook(
				({ value, delay, config }) => useDebounceFn(value, delay, config),
				{
					initialProps: {
						value: fn,
						delay: 500,
						config: {
							leading: true,
						},
					},
				},
			);

			act(() => {
				result.current[0]();
			});

			expect(fn).toHaveBeenCalledOnce();
		});

		test("it calls the function only after the delay if leading is not passed ", () => {
			const fn = vi.fn();

			const { result, rerender } = renderHook(
				({ value, delay }) => useDebounceFn(value, delay),
				{
					initialProps: {
						value: fn,
						delay: 500,
					},
				},
			);

			act(() => {
				result.current[0]();
			});

			expect(fn).not.toHaveBeenCalled();

			act(() => {
				vi.advanceTimersByTime(500);
			});

			expect(fn).toHaveBeenCalledOnce();
		});

		test("it shouldn't call the function when cancel called before delay is completed", () => {
			const fn = vi.fn();

			const { result, rerender } = renderHook(
				({ value, delay }) => useDebounceFn(value, delay),
				{
					initialProps: {
						value: fn,
						delay: 500,
					},
				},
			);

			act(() => {
				// calling cancel
				result.current[1]();
			});

			act(() => {
				vi.advanceTimersByTime(500);
			});

			expect(fn).not.toHaveBeenCalled();
		});

		test("it should call the function when maxDelay, trailing is passed even when the actual delay is skippied", () => {
			const fn = vi.fn();

			const { result, rerender } = renderHook(
				({ value, delay, config }) => useDebounceFn(value, delay, config),
				{
					initialProps: {
						value: fn,
						delay: 500,
						config: {
							trailing: true,
							maxDealy: 750,
						},
					},
				},
			);

			act(() => {
				// calling debouncedFn
				result.current[0]();
			});

			act(() => {
				vi.advanceTimersByTime(250);
			});

			expect(fn).not.toHaveBeenCalled();

			act(() => {
				// calling debouncedFn to cancel running call
				result.current[0]();
			});

			act(() => {
				// advancing time by maxDelay so that fn can be called
				vi.advanceTimersByTime(250);
			});

			expect(fn).not.toHaveBeenCalled();

			act(() => {
				// calling debouncedFn to cancel running call
				result.current[0]();
			});

			act(() => {
				// advancing time by maxDelay so that fn can be called
				vi.advanceTimersByTime(250);
			});

			expect(fn).toHaveBeenCalledOnce();
		});
	});
});
