import { describe, expect, it } from "vitest";
import {
  detectQuestionScope,
  isWriteRequest,
  looksLikeEcommerceDomain,
  messageForRefusal,
  SCOPE_MESSAGES,
} from "@/query-agent/domain/scope";

describe("detectQuestionScope", () => {
  it("blocks write / mutation requests", () => {
    expect(detectQuestionScope("Please delete product 42").reason).toBe(
      "write_blocked",
    );
    expect(detectQuestionScope("Update the price of Mountain Bike").reason).toBe(
      "write_blocked",
    );
    expect(detectQuestionScope("Create a new customer named Ada").reason).toBe(
      "write_blocked",
    );
    expect(isWriteRequest("remove this order")).toBe(true);
  });

  it("marks clear off-topic as out_of_scope", () => {
    expect(detectQuestionScope("What is the weather in Sydney?").reason).toBe(
      "out_of_scope",
    );
    expect(detectQuestionScope("Tell me a joke").reason).toBe("out_of_scope");
    expect(detectQuestionScope("Who won the football match?").reason).toBe(
      "out_of_scope",
    );
  });

  it("keeps catalog questions in_scope for classify", () => {
    expect(detectQuestionScope("How many products are there?").reason).toBe(
      "in_scope",
    );
    expect(
      detectQuestionScope("Top customers by sales last year").reason,
    ).toBe("in_scope");
    expect(detectQuestionScope("Average product rating").reason).toBe(
      "in_scope",
    );
    expect(looksLikeEcommerceDomain("list black bikes under $1000")).toBe(
      true,
    );
  });
});

describe("messageForRefusal", () => {
  it("returns fixed professional copy per reason", () => {
    expect(messageForRefusal("write_blocked")).toBe(
      SCOPE_MESSAGES.write_blocked,
    );
    expect(messageForRefusal("out_of_scope")).toContain("outside the ecommerce");
    expect(messageForRefusal("unmapped_read")).toContain("not mapped");
  });
});
