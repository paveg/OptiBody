import { describe, expect, it } from "vitest";
import { trpcRouter } from "~/integrations/trpc/router";

describe("TRPC API Routes", () => {
	describe("people router", () => {
		it("should return a list of people", async () => {
			const caller = trpcRouter.createCaller({});
			const result = await caller.people.list();

			expect(result).toEqual([{ name: "John Doe" }, { name: "Jane Doe" }]);
		});

		it("should return an array", async () => {
			const caller = trpcRouter.createCaller({});
			const result = await caller.people.list();

			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(2);
		});

		it("should return objects with name property", async () => {
			const caller = trpcRouter.createCaller({});
			const result = await caller.people.list();

			for (const person of result) {
				expect(person).toHaveProperty("name");
				expect(typeof person.name).toBe("string");
			}
		});
	});

	describe("router configuration", () => {
		it("should have people router", () => {
			expect(trpcRouter._def.procedures).toHaveProperty("people.list");
		});

		it("should be able to create caller", () => {
			const caller = trpcRouter.createCaller({});
			expect(caller).toBeDefined();
			expect(caller.people).toBeDefined();
			expect(caller.people.list).toBeInstanceOf(Function);
		});
	});
});
