import { HdvEntrySchema } from "../hdvClient";
import { getListingKey } from "../../ingest/ingestHdv";
import { quantiles } from "../../ingest/statsUtils";

test("Zod parse", () => {
  const valid = HdvEntrySchema.parse({
    pseudo: "a", quantity: 1, expiry: 1, sold: 0, price: 10, superexpiry: 2, itemName: "b"
  });
  expect(valid.pseudo).toBe("a");
});

test("listing_key stable", () => {
  const e = { pseudo: "a", quantity: 1, expiry: 1, sold: 0, price: 10, superexpiry: 2, itemName: "b" };
  expect(getListingKey(e as any)).toBe(getListingKey(e as any));
});

test("quantiles", () => {
  expect(quantiles([1, 2, 3, 4, 5], [0.1, 0.5, 0.9])).toEqual([1.4, 3, 4.6]);
});
