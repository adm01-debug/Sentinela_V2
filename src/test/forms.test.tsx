import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  FormInput,
  FormTextarea,
  FormSelect,
  FormSwitch,
  FormSection,
  FormRow,
} from "@/components/forms";

describe("Form Components", () => {
  describe("FormInput", () => {
    it("renders with label and required indicator", () => {
      render(<FormInput name="email" label="Email" value="" onChange={() => {}} required />);
      expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
      expect(screen.getByText("*")).toBeInTheDocument();
    });

    it("shows error state", () => {
      render(
        <FormInput name="email" label="Email" value="" onChange={() => {}} error="Obrigatório" />
      );
      expect(screen.getByText("Obrigatório")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
    });

    it("shows description text", () => {
      render(
        <FormInput
          name="email"
          label="Email"
          value=""
          onChange={() => {}}
          description="Seu email"
        />
      );
      expect(screen.getByText("Seu email")).toBeInTheDocument();
    });
  });

  describe("FormTextarea", () => {
    it("renders with label", () => {
      render(<FormTextarea name="notes" label="Notas" value="" onChange={() => {}} />);
      expect(screen.getByLabelText("Notas")).toBeInTheDocument();
    });
  });

  describe("FormSelect", () => {
    it("renders with label", () => {
      const options = [{ value: "a", label: "Option A" }];
      render(
        <FormSelect name="status" label="Status" options={options} value="" onChange={() => {}} />
      );
      expect(screen.getByText("Status")).toBeInTheDocument();
    });
  });

  describe("FormSwitch", () => {
    it("renders with label and description", () => {
      render(
        <FormSwitch
          name="active"
          label="Ativo"
          checked={false}
          onChange={() => {}}
          description="Toggle desc"
        />
      );
      expect(screen.getByText("Ativo")).toBeInTheDocument();
      expect(screen.getByText("Toggle desc")).toBeInTheDocument();
    });
  });

  describe("FormSection", () => {
    it("renders section title and children", () => {
      render(
        <FormSection title="Info" description="Detalhes">
          <p>Child content</p>
        </FormSection>
      );
      expect(screen.getByText("Info")).toBeInTheDocument();
      expect(screen.getByText("Detalhes")).toBeInTheDocument();
      expect(screen.getByText("Child content")).toBeInTheDocument();
    });
  });

  describe("FormRow", () => {
    it("renders children in grid", () => {
      render(
        <FormRow cols={2}>
          <div>Col 1</div>
          <div>Col 2</div>
        </FormRow>
      );
      expect(screen.getByText("Col 1")).toBeInTheDocument();
      expect(screen.getByText("Col 2")).toBeInTheDocument();
    });
  });
});
