import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VoiceInput } from "../VoiceInput";

const mockSpeechRecognition = {
  start: vi.fn(),
  stop: vi.fn(),
  abort: vi.fn(),
  onstart: null,
  onend: null,
  onresult: null,
  onerror: null,
};

beforeEach(() => {
  (window as any).SpeechRecognition = vi.fn(() => mockSpeechRecognition);
  (window as any).webkitSpeechRecognition = vi.fn(() => mockSpeechRecognition);
});

describe("VoiceInput Component", () => {
  it("renders voice input button", () => {
    render(<VoiceInput onResult={() => {}} />);
    expect(screen.getByRole("button", { name: /voice|microphone/i })).toBeInTheDocument();
  });

  it("starts recording on click", async () => {
    const user = userEvent.setup();
    render(<VoiceInput onResult={() => {}} />);
    
    await user.click(screen.getByRole("button"));
    expect(mockSpeechRecognition.start).toHaveBeenCalled();
  });

  it("stops recording on second click", async () => {
    const user = userEvent.setup();
    render(<VoiceInput onResult={() => {}} />);
    
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("button"));
    
    expect(mockSpeechRecognition.stop).toHaveBeenCalled();
  });

  it("shows recording indicator", async () => {
    const user = userEvent.setup();
    render(<VoiceInput onResult={() => {}} />);
    
    await user.click(screen.getByRole("button"));
    expect(screen.getByTestId("recording-indicator")).toBeInTheDocument();
  });

  it("calls onResult with transcript", async () => {
    const onResult = vi.fn();
    render(<VoiceInput onResult={onResult} />);
    
    const button = screen.getByRole("button");
    await userEvent.click(button);
    
    mockSpeechRecognition.onresult?.({
      results: [[{ transcript: "Hello world" }]],
    });
    
    expect(onResult).toHaveBeenCalledWith("Hello world");
  });

  it("handles unsupported browser", () => {
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;
    
    render(<VoiceInput onResult={() => {}} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows error state", async () => {
    const user = userEvent.setup();
    const onError = vi.fn();
    
    render(<VoiceInput onResult={() => {}} onError={onError} />);
    
    await user.click(screen.getByRole("button"));
    mockSpeechRecognition.onerror?.({ error: "no-speech" });
    
    expect(onError).toHaveBeenCalled();
  });
});
