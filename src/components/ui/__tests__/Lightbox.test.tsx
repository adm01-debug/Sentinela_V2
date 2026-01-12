import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Lightbox } from "../Lightbox";

const images = [
  { src: "/img1.jpg", alt: "Image 1" },
  { src: "/img2.jpg", alt: "Image 2" },
];

describe("Lightbox Component", () => {
  it("renders when open", () => {
    render(<Lightbox open images={images} currentIndex={0} onClose={() => {}} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<Lightbox open={false} images={images} currentIndex={0} onClose={() => {}} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("displays current image", () => {
    render(<Lightbox open images={images} currentIndex={0} onClose={() => {}} />);
    expect(screen.getByAltText("Image 1")).toBeInTheDocument();
  });

  it("navigates to next image", async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    
    render(<Lightbox open images={images} currentIndex={0} onClose={() => {}} onIndexChange={onIndexChange} />);
    
    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(onIndexChange).toHaveBeenCalledWith(1);
  });

  it("navigates to previous image", async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    
    render(<Lightbox open images={images} currentIndex={1} onClose={() => {}} onIndexChange={onIndexChange} />);
    
    await user.click(screen.getByRole("button", { name: /previous/i }));
    expect(onIndexChange).toHaveBeenCalledWith(0);
  });

  it("closes on close button click", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<Lightbox open images={images} currentIndex={0} onClose={onClose} />);
    
    await user.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("closes on escape key", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(<Lightbox open images={images} currentIndex={0} onClose={onClose} />);
    
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("supports zoom", async () => {
    const user = userEvent.setup();
    render(<Lightbox open images={images} currentIndex={0} onClose={() => {}} zoom />);
    
    await user.click(screen.getByRole("button", { name: /zoom/i }));
    expect(screen.getByAltText("Image 1")).toHaveClass("zoomed");
  });
});
