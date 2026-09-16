import type { CalendarEvent, Person } from "@calcom/types/Calendar";
import { render, screen } from "@testing-library/react";
import type { TFunction } from "i18next";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { NoShowFeeChargedEmail } from "./NoShowFeeChargedEmail";

vi.mock("./BaseScheduledEmail", () => ({
  BaseScheduledEmail: ({ subtitle }: { subtitle: ReactNode }) => (
    <div data-testid="subHeading">{subtitle}</div>
  ),
}));

const t = ((key: string, vars?: Record<string, unknown>) => {
  if (key === "no_show_fee_charged_subtitle") {
    return `Subtitle no-show fee of ${String(vars?.amount ?? "")}`;
  }
  return key;
}) as unknown as TFunction;

const makeAttendee = (): Person => ({
  name: "Attendee Example",
  email: "attendee@example.com",
  timeZone: "UTC",
  language: { translate: t, locale: "en" },
});

const makeCalEvent = (paymentInfo: NonNullable<CalendarEvent["paymentInfo"]>): CalendarEvent => ({
  type: "30min",
  title: "Test meeting",
  startTime: "2026-09-16T10:00:00.000Z",
  endTime: "2026-09-16T10:30:00.000Z",
  organizer: makeAttendee(),
  attendees: [makeAttendee()],
  paymentInfo,
});

describe("NoShowFeeChargedEmail subtitle amount", () => {
  it("uses the presentable two-decimal amount in the subtitle", () => {
    render(
      <NoShowFeeChargedEmail
        calEvent={makeCalEvent({ amount: 5000, currency: "usd" })}
        attendee={makeAttendee()}
      />
    );

    expect(screen.getByTestId("subHeading")).toHaveTextContent("Subtitle no-show fee of 50");
  });

  it("does not divide zero-decimal amounts by 100 in the subtitle", () => {
    render(
      <NoShowFeeChargedEmail
        calEvent={makeCalEvent({ amount: 5000, currency: "jpy" })}
        attendee={makeAttendee()}
      />
    );

    expect(screen.getByTestId("subHeading")).toHaveTextContent("Subtitle no-show fee of 5000");
  });
});
