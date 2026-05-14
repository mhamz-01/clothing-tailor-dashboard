"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardError() {
  const router = useRouter()

  return (
    <Card className="max-w-lg border-red-200 bg-red-50/80">
      <CardHeader>
        <CardTitle className="text-red-900">Something went wrong</CardTitle>
        <CardDescription className="text-red-800">
          Failed to load dashboard data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button type="button" onClick={() => router.refresh()}>
          Retry
        </Button>
      </CardContent>
    </Card>
  )
}
