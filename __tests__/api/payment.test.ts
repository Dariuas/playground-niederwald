/**
 * Integration tests for app/api/payment/route.ts
 *
 * All network calls are intercepted via jest.spyOn(global, "fetch") so no
 * real Square (or Resend) requests are made during the test run.
 */

import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Module-level mocks — must be declared before the route import so that
// module resolution picks them up when the route file is loaded.
// ---------------------------------------------------------------------------

// Stable send spy shared across the module lifetime so the route and the
// test assertions always reference the same function instance.
const mockEmailSend = jest.fn().mockResolvedValue({});

// Mock @/lib/resend to avoid instantiating the Resend SDK (which would
// require a live API key).
jest.mock("@/lib/resend", () => ({
  getResend: () => ({ emails: { send: mockEmailSend } }),
  FROM: "test@example.com",
  NOTIFY_EMAIL: "notify@example.com",
}));

// Mock @/lib/qrcode so we don't spin up the QRCode canvas renderer in Node.
jest.mock("@/lib/qrcode", () => ({
  generateQRDataURL: jest.fn().mockResolvedValue("data:image/png;base64,FAKE"),
}));

// Import the route handler *after* the mocks are registered.
import { POST } from "@/app/api/payment/route";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal NextRequest with the given JSON body. */
function buildRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost/api/payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** A minimal happy-path Square payment response. */
function squareSuccessPayload(overrides: Record<string, unknown> = {}) {
  return {
    payment: {
      id: "sq_pay_abc123",
      status: "COMPLETED",
      ...overrides,
    },
  };
}

/** Stub global.fetch to return the provided body and status. */
function mockFetch(body: unknown, status = 200) {
  return jest.spyOn(global, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    })
  );
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  // Provide dummy env vars so the route can read them without crashing.
  process.env.SQUARE_ACCESS_TOKEN = "test-access-token";
  process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID = "TEST_LOCATION_ID";
  // Keep RESEND_API_KEY unset by default so email code paths are skipped
  // unless a specific test needs them.
  delete process.env.RESEND_API_KEY;
});

afterEach(() => {
  jest.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("POST /api/payment", () => {
  // ---- 1. Validation -------------------------------------------------------

  describe("validation", () => {
    it("returns 400 when token is missing", async () => {
      const req = buildRequest({ amountCents: 1000 }); // no token
      const res = await POST(req);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty("error");
      expect(typeof body.error).toBe("string");
    });

    it("returns 400 when amountCents is missing", async () => {
      const req = buildRequest({ token: "cnon:card-nonce-ok" }); // no amount
      const res = await POST(req);

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty("error");
    });

    it("returns 400 when both token and amountCents are missing", async () => {
      const req = buildRequest({});
      const res = await POST(req);

      expect(res.status).toBe(400);
    });
  });

  // ---- 2. Success path -----------------------------------------------------

  describe("success path", () => {
    it("returns ok:true, paymentId, orderNumber, and status on a 200 from Square", async () => {
      mockFetch(squareSuccessPayload());

      const req = buildRequest({
        token: "cnon:card-nonce-ok",
        amountCents: 2500,
        note: "Test purchase",
        customerName: "Jane Doe",
        customerEmail: "jane@example.com",
        items: [{ name: "Day Pass", quantity: 2 }],
        totalPrice: 23.15,
        tax: 1.85,
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.ok).toBe(true);
      expect(body.paymentId).toBe("sq_pay_abc123");
      expect(body.status).toBe("COMPLETED");
      expect(typeof body.orderNumber).toBe("string");
      expect(body.orderNumber).toMatch(/^PN-\d{6}$/);
    });

    it("includes a 6-digit numeric order number with the PN- prefix", async () => {
      mockFetch(squareSuccessPayload());

      const req = buildRequest({ token: "cnon:card-nonce-ok", amountCents: 500 });
      const res = await POST(req);
      const { orderNumber } = await res.json();

      expect(orderNumber).toMatch(/^PN-\d{6}$/);
    });
  });

  // ---- 3. Correct payload sent to Square -----------------------------------

  describe("Square request payload", () => {
    it("sends the correct amount, currency, source_id, and location_id", async () => {
      const fetchSpy = mockFetch(squareSuccessPayload());

      const req = buildRequest({
        token: "cnon:card-nonce-ok",
        amountCents: 3750,
      });

      await POST(req);

      expect(fetchSpy).toHaveBeenCalledTimes(1);

      // Verify the URL
      const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toBe("https://connect.squareup.com/v2/payments");

      // Verify headers
      const headers = init.headers as Record<string, string>;
      expect(headers["Authorization"]).toBe("Bearer test-access-token");
      expect(headers["Content-Type"]).toBe("application/json");
      expect(headers["Square-Version"]).toBe("2024-10-17");

      // Verify body
      const sentBody = JSON.parse(init.body as string);
      expect(sentBody.source_id).toBe("cnon:card-nonce-ok");
      expect(sentBody.amount_money).toEqual({ amount: 3750, currency: "USD" });
      expect(sentBody.location_id).toBe("TEST_LOCATION_ID");

      // idempotency_key must be present and look like a UUID
      expect(sentBody.idempotency_key).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it("uses a different idempotency_key on every request", async () => {
      // Call the route twice; each call should generate its own UUID.
      mockFetch(squareSuccessPayload());
      mockFetch(squareSuccessPayload());

      const fetchSpy = jest.spyOn(global, "fetch");

      const body = { token: "cnon:card-nonce-ok", amountCents: 100 };
      await POST(buildRequest(body));
      await POST(buildRequest(body));

      const key1 = JSON.parse(fetchSpy.mock.calls[0][1]!.body as string).idempotency_key;
      const key2 = JSON.parse(fetchSpy.mock.calls[1][1]!.body as string).idempotency_key;

      expect(key1).not.toBe(key2);
    });

    it("uses a default note containing the order number when note is omitted", async () => {
      const fetchSpy = mockFetch(squareSuccessPayload());

      await POST(buildRequest({ token: "cnon:card-nonce-ok", amountCents: 100 }));

      const sentBody = JSON.parse(fetchSpy.mock.calls[0][1]!.body as string);
      expect(sentBody.note).toMatch(/^The Playground @niederwald — PN-\d{6}$/);
    });

    it("uses the caller-supplied note when provided", async () => {
      const fetchSpy = mockFetch(squareSuccessPayload());

      await POST(
        buildRequest({ token: "cnon:card-nonce-ok", amountCents: 100, note: "Custom note" })
      );

      const sentBody = JSON.parse(fetchSpy.mock.calls[0][1]!.body as string);
      expect(sentBody.note).toBe("Custom note");
    });
  });

  // ---- 4. Square error propagation -----------------------------------------

  describe("Square error propagation", () => {
    it("returns the Square error detail and the upstream status code when Square rejects", async () => {
      mockFetch(
        {
          errors: [
            {
              category: "PAYMENT_METHOD_ERROR",
              code: "CARD_DECLINED",
              detail: "Card was declined.",
            },
          ],
        },
        402
      );

      const req = buildRequest({ token: "cnon:card-nonce-ok", amountCents: 1000 });
      const res = await POST(req);

      expect(res.status).toBe(402);
      const body = await res.json();
      expect(body.error).toBe("Card was declined.");
    });

    it("falls back to a generic error message when Square provides no error detail", async () => {
      mockFetch({ errors: [] }, 500);

      const req = buildRequest({ token: "cnon:card-nonce-ok", amountCents: 1000 });
      const res = await POST(req);

      expect(res.status).toBe(500);
      const body = await res.json();
      expect(typeof body.error).toBe("string");
      expect(body.error.length).toBeGreaterThan(0);
    });

    it("does not send emails when Square rejects", async () => {
      process.env.RESEND_API_KEY = "re_test_key"; // enable the email path
      mockEmailSend.mockClear();

      mockFetch({ errors: [{ detail: "Card declined" }] }, 402);

      const req = buildRequest({
        token: "cnon:card-nonce-ok",
        amountCents: 1000,
        customerEmail: "user@example.com",
      });

      await POST(req);

      expect(mockEmailSend).not.toHaveBeenCalled();
    });
  });

  // ---- 5. Email path (when RESEND_API_KEY is set) --------------------------

  describe("email notifications", () => {
    beforeEach(() => {
      process.env.RESEND_API_KEY = "re_test_key";
    });

    it("sends two emails (confirmation + notification) when customerEmail is supplied", async () => {
      mockFetch(squareSuccessPayload());
      mockEmailSend.mockClear();

      const req = buildRequest({
        token: "cnon:card-nonce-ok",
        amountCents: 1500,
        customerName: "Alice",
        customerEmail: "alice@example.com",
        items: [{ name: "Wristband", quantity: 1 }],
        totalPrice: 13.89,
        tax: 1.11,
      });

      await POST(req);

      expect(mockEmailSend).toHaveBeenCalledTimes(2);
    });

    it("skips emails when customerEmail is absent", async () => {
      mockFetch(squareSuccessPayload());
      mockEmailSend.mockClear();

      // No customerEmail in payload
      const req = buildRequest({ token: "cnon:card-nonce-ok", amountCents: 1500 });
      await POST(req);

      expect(mockEmailSend).not.toHaveBeenCalled();
    });
  });
});
