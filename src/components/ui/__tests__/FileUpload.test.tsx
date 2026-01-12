import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileUpload } from "../FileUpload";

describe("FileUpload Component", () => {
  it("renders file upload zone", () => {
    render(<FileUpload />);
    expect(screen.getByText(/drag.*drop|click.*upload/i)).toBeInTheDocument();
  });

  it("handles file selection", async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn();
    
    render(<FileUpload onUpload={onUpload} />);
    
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    const input = screen.getByTestId("file-input") as HTMLInputElement;
    
    await user.upload(input, file);
    expect(onUpload).toHaveBeenCalledWith(expect.arrayContaining([file]));
  });

  it("validates file types", async () => {
    const user = userEvent.setup();
    const onError = vi.fn();
    
    render(<FileUpload accept=".pdf" onError={onError} />);
    
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    const input = screen.getByTestId("file-input") as HTMLInputElement;
    
    await user.upload(input, file);
    expect(onError).toHaveBeenCalled();
  });

  it("validates file size", async () => {
    const user = userEvent.setup();
    const onError = vi.fn();
    
    render(<FileUpload maxSize={100} onError={onError} />);
    
    const largeFile = new File(["x".repeat(200)], "large.txt", { type: "text/plain" });
    const input = screen.getByTestId("file-input") as HTMLInputElement;
    
    await user.upload(input, largeFile);
    expect(onError).toHaveBeenCalled();
  });

  it("supports multiple files", async () => {
    const user = userEvent.setup();
    const onUpload = vi.fn();
    
    render(<FileUpload multiple onUpload={onUpload} />);
    
    const files = [
      new File(["1"], "file1.txt", { type: "text/plain" }),
      new File(["2"], "file2.txt", { type: "text/plain" }),
    ];
    const input = screen.getByTestId("file-input") as HTMLInputElement;
    
    await user.upload(input, files);
    expect(onUpload).toHaveBeenCalledWith(expect.arrayContaining(files));
  });

  it("shows upload progress", async () => {
    render(<FileUpload showProgress />);
    
    const file = new File(["content"], "test.txt", { type: "text/plain" });
    const input = screen.getByTestId("file-input") as HTMLInputElement;
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
  });

  it("renders disabled state", () => {
    render(<FileUpload disabled />);
    expect(screen.getByTestId("file-input")).toBeDisabled();
  });
});
