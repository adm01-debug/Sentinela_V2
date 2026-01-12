import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "../AlertDialog";

describe("AlertDialog Component", () => {
  it("opens on trigger click", async () => {
    const user = userEvent.setup();
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm</AlertDialogTitle>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    );
    
    await user.click(screen.getByText("Open"));
    await waitFor(() => {
      expect(screen.getByText("Confirm")).toBeInTheDocument();
    });
  });

  it("calls action callback", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogFooter>
            <AlertDialogAction onClick={onAction}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
    
    await user.click(screen.getByText("Confirm"));
    expect(onAction).toHaveBeenCalled();
  });

  it("closes on cancel", async () => {
    const user = userEvent.setup();
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
    
    await user.click(screen.getByText("Cancel"));
    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });

  it("renders description", () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogDescription>Are you sure?</AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>
    );
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("has correct ARIA attributes", () => {
    render(
      <AlertDialog defaultOpen>
        <AlertDialogContent>Content</AlertDialogContent>
      </AlertDialog>
    );
    expect(screen.getByRole("alertdialog")).toHaveAttribute("aria-modal", "true");
  });
});
