"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Filter } from "lucide-react"

const residents = [
  {
    id: 1,
    name: "John Martinez",
    age: 72,
    status: "Active",
    riskLevel: "High",
    lastUpdate: "2 hours ago",
  },
  {
    id: 2,
    name: "Maria Santos",
    age: 68,
    status: "Active",
    riskLevel: "Medium",
    lastUpdate: "5 hours ago",
  },
  {
    id: 3,
    name: "Robert Chen",
    age: 81,
    status: "Critical",
    riskLevel: "High",
    lastUpdate: "1 day ago",
  },
  {
    id: 4,
    name: "Eleanor Thompson",
    age: 75,
    status: "Active",
    riskLevel: "Low",
    lastUpdate: "30 min ago",
  },
  {
    id: 5,
    name: "James Wilson",
    age: 69,
    status: "Active",
    riskLevel: "Low",
    lastUpdate: "1 hour ago",
  },
  {
    id: 6,
    name: "Patricia Davis",
    age: 77,
    status: "Active",
    riskLevel: "Medium",
    lastUpdate: "3 hours ago",
  },
]

function getRiskBadgeVariant(risk: string) {
  switch (risk) {
    case "High":
      return "destructive"
    case "Medium":
      return "secondary"
    case "Low":
      return "outline"
    default:
      return "secondary"
  }
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "Critical":
      return "bg-destructive/20 text-destructive border-destructive/30"
    case "Active":
      return "bg-success/20 text-success border-success/30"
    default:
      return "bg-secondary text-secondary-foreground"
  }
}

export function ResidentsTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [riskFilter, setRiskFilter] = useState("all")

  const filteredResidents = residents.filter((resident) => {
    const matchesSearch = resident.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesRisk =
      riskFilter === "all" ||
      resident.riskLevel.toLowerCase() === riskFilter.toLowerCase()
    return matchesSearch && matchesRisk
  })

  return (
    <Card className="border-border">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-semibold">Residents</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search residents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:w-64"
              />
            </div>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Last Update</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResidents.map((resident) => (
              <TableRow key={resident.id}>
                <TableCell className="font-medium">{resident.name}</TableCell>
                <TableCell>{resident.age}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getStatusBadgeClass(resident.status)}
                  >
                    {resident.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getRiskBadgeVariant(resident.riskLevel)}>
                    {resident.riskLevel}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {resident.lastUpdate}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
