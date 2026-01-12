import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImageGallery } from "../ImageGallery";

const images = [
  { src: "/img1.jpg", alt: "Image 1" },
  { src: "/img2.jpg", alt: "Image 2" },
  { src: "/img3.jpg", alt: "Image 3" },
];

describe("ImageGallery Component", () => {
  it("renders all images", () => {
    render(<ImageGallery images={images} />);
    
    images.forEach(img => {
      expect(screen.getByAltText(img.alt)).toBeInTheDocument();
    });
  });

  it("opens lightbox on image click", async () => {
    const user = userEvent.setup();
    render(<ImageGallery images={images} lightbox />);
    
    await user.click(screen.getByAltText("Image 1"));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("navigates between images", async () => {
    const user = userEvent.setup();
    render(<ImageGallery images={images} lightbox />);
    
    await user.click(screen.getByAltText("Image 1"));
    await user.click(screen.getByRole("button", { name: /next/i }));
    
    expect(screen.getByAltText("Image 2")).toBeVisible();
  });

  it("supports grid layout", () => {
    render(<ImageGallery images={images} layout="grid" columns={3} data-testid="gallery" />);
    expect(screen.getByTestId("gallery")).toHaveClass("grid-cols-3");
  });

  it("supports masonry layout", () => {
    render(<ImageGallery images={images} layout="masonry" data-testid="gallery" />);
    expect(screen.getByTestId("gallery")).toHaveClass("masonry");
  });

  it("handles image loading error", () => {
    render(<ImageGallery images={[{ src: "/broken.jpg", alt: "Broken" }]} />);
    const img = screen.getByAltText("Broken");
    img.dispatchEvent(new Event("error"));
    expect(screen.getByTestId("image-placeholder")).toBeInTheDocument();
  });
});
