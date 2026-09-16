import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChargeCardDialog } from "../ChargeCardDialog";

vi.mock("@calcom/trpc/react", () => ({
  trpc: {
    useUtils: () => ({
      viewer: {
        bookings: {
          invalidate: vi.fn(),
        },
      },
    }),
  },
}));

vi.mock("@calcom/lib/hooks/useLocale", () => ({
  useLocale: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (key === "charge_card_dialog_body" || key === "charge_attendee") {
        const opts = options as {
          amount?: number;
          formatParams?: { amount?: { currency?: string } };
        };
        return `${key} ${opts?.amount} ${opts?.formatParams?.amount?.currency}`;
      }
      return key;
    },
  }),
}));

afterEach(() => {
  cleanup();
});

describe("ChargeCardDialog no-show fee amount", () => {
  it("displays a two-decimal currency amount without extra scaling", () => {
    render(
      <ChargeCardDialog
        isOpenDialog
        setIsOpenDialog={vi.fn()}
        bookingId={1}
        paymentAmount={5000}
        paymentCurrency="usd"
      />
    );

    expect(screen.getByText("charge_card_dialog_body 50 usd")).toBeInTheDocument();
    expect(screen.getByText("charge_attendee 50 usd")).toBeInTheDocument();
  });

  it("displays a zero-decimal currency amount without dividing by 100", () => {
    render(
      <ChargeCardDialog
        isOpenDialog
        setIsOpenDialog={vi.fn()}
        bookingId={1}
        paymentAmount={5000}
        paymentCurrency="jpy"
      />
    );

    expect(screen.getByText("charge_card_dialog_body 5000 jpy")).toBeInTheDocument();
    expect(screen.getByText("charge_attendee 5000 jpy")).toBeInTheDocument();
  });
});
