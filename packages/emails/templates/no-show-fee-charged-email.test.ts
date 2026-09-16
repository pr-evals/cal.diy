import type { CalendarEvent, Person } from "@calcom/types/Calendar";
import type { TFunction } from "i18next";
import { describe, expect, it, vi } from "vitest";
import NoShowFeeChargedEmail from "./no-show-fee-charged-email";

vi.mock("../src/renderEmail", () => ({
  default: vi.fn(async () => "<html></html>"),
}));

class TestNoShowFeeChargedEmail extends NoShowFeeChargedEmail {
  public async getPayload() {
    return await this.getNodeMailerPayload();
  }
}

const t = ((key: string, vars?: Record<string, unknown>) => {
  if (key === "no_show_fee_charged_email_subject") {
    return `No-show fee of ${String(vars?.amount ?? "")} charged`;
  }
  return key;
}) as unknown as TFunction;

const makePerson = (): Person => ({
  name: "Attendee Example",
  email: "attendee@example.com",
  timeZone: "UTC",
  language: { translate: t, locale: "en" },
});

const makeCalEvent = (paymentInfo: NonNullable<CalendarEvent["paymentInfo"]>): CalendarEvent => {
  const attendee = makePerson();
  return {
    type: "30min",
    title: "Test meeting",
    startTime: "2026-09-16T10:00:00.000Z",
    endTime: "2026-09-16T10:30:00.000Z",
    organizer: {
      name: "Organizer Example",
      email: "organizer@example.com",
      timeZone: "UTC",
      language: { translate: t, locale: "en" },
    },
    attendees: [attendee],
    paymentInfo,
  };
};

describe("NoShowFeeChargedEmail subject amount", () => {
  it("uses the presentable two-decimal amount in the subject", async () => {
    const calEvent = makeCalEvent({ amount: 5000, currency: "usd" });
    const email = new TestNoShowFeeChargedEmail(calEvent, makePerson());
    const payload = await email.getPayload();

    expect(payload.subject).toBe("No-show fee of 50 charged");
  });

  it("does not divide zero-decimal amounts by 100 in the subject", async () => {
    const calEvent = makeCalEvent({ amount: 5000, currency: "jpy" });
    const email = new TestNoShowFeeChargedEmail(calEvent, makePerson());
    const payload = await email.getPayload();

    expect(payload.subject).toBe("No-show fee of 5000 charged");
  });
});
