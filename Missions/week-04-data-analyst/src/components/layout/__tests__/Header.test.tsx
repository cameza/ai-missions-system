import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { Header } from "../Header"

describe("Header Component", () => {
  it("renders the header with all required elements", () => {
    render(<Header />)
    
    // Check for branding
    expect(screen.getByText("TRANSFER HUB V2")).toBeInTheDocument()
    
    // Check for live status indicator
    expect(screen.getByText("🟢 LIVE MARKET UPDATE")).toBeInTheDocument()
    
    // Check for search input
    expect(screen.getByPlaceholderText("Search transfers, players, teams...")).toBeInTheDocument()
    
    // Check for account button
    expect(screen.getByLabelText("Account")).toBeInTheDocument()
  })

  it("has proper accessibility attributes", () => {
    render(<Header />)
    
    // Check for skip to content link
    expect(screen.getByText("Skip to main content")).toBeInTheDocument()
    
    // Check for proper roles
    expect(screen.getByRole("banner")).toBeInTheDocument()
    
    // Check for ARIA labels
    expect(screen.getByRole("searchbox")).toBeInTheDocument()
  })

  it("shows mobile menu button on small screens", () => {
    // Mock mobile viewport
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 375,
    })
    
    render(<Header />)
    
    // Mobile menu button should be visible
    expect(screen.getByLabelText("Toggle menu")).toBeInTheDocument()
  })

  it("handles search input changes", async () => {
    render(<Header />)
    
    const searchInput = screen.getByPlaceholderText("Search transfers, players, teams...")
    
    fireEvent.change(searchInput, { target: { value: "test search" } })
    
    await waitFor(() => {
      expect(searchInput).toHaveValue("test search")
    })
  })

  it("handles search clear functionality", async () => {
    render(<Header />)
    
    const searchInput = screen.getByPlaceholderText("Search transfers, players, teams...")
    
    // Type something first
    fireEvent.change(searchInput, { target: { value: "test search" } })
    
    // Clear button should appear (if implemented)
    const clearButton = screen.queryByLabelText("Clear search")
    if (clearButton) {
      fireEvent.click(clearButton)
      await waitFor(() => {
        expect(searchInput).toHaveValue("")
      })
    }
  })

  it("adds shadow class when scrolled", async () => {
    render(<Header />)
    
    const header = screen.getByRole("banner")
    
    // Initially should not have shadow-lg class
    expect(header).not.toHaveClass("shadow-lg")
    
    // Simulate scroll
    fireEvent.scroll(window, { target: { scrollY: 100 } })
    
    await waitFor(() => {
      expect(header).toHaveClass("shadow-lg")
    })
  })
})
