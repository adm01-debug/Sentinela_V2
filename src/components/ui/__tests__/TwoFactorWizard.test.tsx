import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TwoFactorWizard } from "../TwoFactorWizard";

describe("TwoFactorWizard Component", () => {
  it("renders initial setup step", () => {
    render(<TwoFactorWizard />);
    expect(screen.getByText(/set up two-factor|enable 2fa/i)).toBeInTheDocument();
  });

  it("shows QR code in setup step", async () => {
    const user = userEvent.setup();
    render(<TwoFactorWizard />);
    
    await user.click(screen.getByText(/start|begin|next/i));
    
    await waitFor(() => {
      expect(screen.getByTestId("qr-code")).toBeInTheDocument();
    });
  });

  it("displays manual entry code", async () => {
    const user = userEvent.setup();
    render(<TwoFactorWizard secretKey="ABCD1234EFGH5678" />);
    
    await user.click(screen.getByText(/start|begin|next/i));
    await user.click(screen.getByText(/manual|can.*scan/i));
    
    await waitFor(() => {
      expect(screen.getByText("ABCD1234EFGH5678")).toBeInTheDocument();
    });
  });

  it("validates verification code", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    
    render(<TwoFactorWizard onComplete={onComplete} />);
    
    // Navigate to verification step
    await user.click(screen.getByText(/start|begin|next/i));
    await user.click(screen.getByText(/next|continue/i));
    
    // Enter verification code
    const input = screen.getByPlaceholderText(/code|verify/i);
    await user.type(input, "123456");
    await user.click(screen.getByText(/verify|confirm/i));
    
    expect(onComplete).toHaveBeenCalled();
  });

  it("shows error for invalid code", async () => {
    const user = userEvent.setup();
    render(<TwoFactorWizard />);
    
    await user.click(screen.getByText(/start|begin|next/i));
    await user.click(screen.getByText(/next|continue/i));
    
    const input = screen.getByPlaceholderText(/code|verify/i);
    await user.type(input, "000000");
    await user.click(screen.getByText(/verify|confirm/i));
    
    await waitFor(() => {
      expect(screen.getByText(/invalid|incorrect/i)).toBeInTheDocument();
    });
  });

  it("shows recovery codes on completion", async () => {
    const user = userEvent.setup();
    const recoveryCodes = ["ABC123", "DEF456", "GHI789"];
    
    render(<TwoFactorWizard recoveryCodes={recoveryCodes} />);
    
    // Complete setup
    await user.click(screen.getByText(/start|begin|next/i));
    await user.click(screen.getByText(/next|continue/i));
    
    await waitFor(() => {
      expect(screen.getByText(/recovery codes|backup codes/i)).toBeInTheDocument();
    });
  });

  it("supports cancel action", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    
    render(<TwoFactorWizard onCancel={onCancel} />);
    
    await user.click(screen.getByText(/cancel|back/i));
    expect(onCancel).toHaveBeenCalled();
  });
});
