"use client";

import { DashboardCharts } from "@/components/features/dashboard/DashboardCharts";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardPage() {
  return (
    <DashboardLayout showSidebar={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Transfer Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time transfer market analytics and insights
          </p>
        </div>
        
        <DashboardCharts />
      </div>
    </DashboardLayout>
  );
}
