"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchInput } from "@/components/ui/search-input"

export default function ComponentDemo() {
  const [searchValue, setSearchValue] = useState("")
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSearch = () => {
    console.log("Searching for:", searchValue)
  }

  const handleClearSearch = () => {
    setSearchValue("")
  }

  const simulateLoading = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-primary">UI Components Demo</h1>
        <p className="text-muted-foreground">
          Showcase of Button and Input components with Transfer Hub design system
        </p>
      </div>

      {/* Button Variants */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Button Variants</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="gradient">Gradient</Button>
        </div>
      </section>

      {/* Button Sizes */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Button Sizes</h2>
        <div className="flex items-center gap-4">
          <Button size="sm">Small (32px)</Button>
          <Button size="default">Medium (40px)</Button>
          <Button size="lg">Large (48px)</Button>
        </div>
      </section>

      {/* Button States */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Button States</h2>
        <div className="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button disabled>Disabled</Button>
          <Button loading={loading} onClick={simulateLoading}>
            {loading ? "Loading..." : "Simulate Loading"}
          </Button>
        </div>
      </section>

      {/* Input Components */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Input Components</h2>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-2">Standard Input</label>
            <Input
              placeholder="Enter text..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Error State</label>
            <Input
              placeholder="Error input..."
              error
            />
          </div>
        </div>
      </section>

      {/* Search Input */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Search Input</h2>
        <div className="max-w-md space-y-4">
          <SearchInput
            placeholder="Search transfers..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onClear={handleClearSearch}
          />
          
          <div className="flex gap-2">
            <Button onClick={handleSearch}>Search</Button>
            <Button variant="ghost" onClick={handleClearSearch}>
              Clear
            </Button>
          </div>
        </div>
      </section>

      {/* Form Example */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Form Example</h2>
        <div className="max-w-md space-y-4 p-6 border rounded-lg bg-card">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Player Name</label>
            <Input placeholder="Enter player name..." />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Search Club</label>
            <SearchInput placeholder="Search for a club..." />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit">Submit</Button>
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </div>
        </div>
      </section>

      {/* Accessibility Info */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Accessibility Features</h2>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>✅ Keyboard navigation supported</p>
          <p>✅ Focus indicators with accent-green color</p>
          <p>✅ ARIA labels and semantic HTML</p>
          <p>✅ Touch-friendly sizing for mobile</p>
          <p>✅ High contrast in dark theme</p>
        </div>
      </section>
    </div>
  )
}
