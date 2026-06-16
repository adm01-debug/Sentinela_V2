import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { GeofencingPage } from "../GeofencingPage";
import * as useGeofencingPageHook from "@/hooks/useGeofencingPage";

// Mocks
vi.mock("@/hooks/useGeofencingPage", () => ({
  useGeofencingPage: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe("GeofencingPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useGeofencingPageHook.useGeofencingPage).mockReturnValue({
      geofences: [
        {
          id: "1",
          name: "Office",
          radius: 100,
          is_active: true,
          center_lat: 0,
          center_lng: 0,
          color: "#f00",
        },
      ],
      stats: { total: 1, active: 1, restricted: 0, required: 0 },
      isLoading: false,
      handleOpenCreate: vi.fn(),
      handleOpenEdit: vi.fn(),
      handleDelete: vi.fn(),
      setFormData: vi.fn(),
      formData: {
        name: "",
        description: "",
        center_lat: 0,
        center_lng: 0,
        radius: 100,
        is_active: true,
      },
      isDialogOpen: false,
      isDeleteDialogOpen: false,
      setIsDeleteDialogOpen: vi.fn(),
      handleCloseDialog: vi.fn(),
      handleSubmit: vi.fn(),
      selectedGeofence: null,
      setSelectedGeofence: vi.fn(),
      editingGeofence: null,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    } as unknown as ReturnType<typeof useGeofencingPageHook.useGeofencingPage>);
  });

  const renderGeofencing = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <GeofencingPage />
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  it("renders correctly", () => {
    renderGeofencing();
    expect(screen.getByText("Geofencing")).toBeInTheDocument();
    expect(screen.getByText("Office")).toBeInTheDocument();
    expect(screen.getByText("100m")).toBeInTheDocument();
  });

  it("opens create dialog", () => {
    const { handleOpenCreate } = useGeofencingPageHook.useGeofencingPage();
    renderGeofencing();
    const addButton = screen.getByText("Nova Geofence");
    fireEvent.click(addButton);
    expect(handleOpenCreate).toHaveBeenCalled();
  });
});
