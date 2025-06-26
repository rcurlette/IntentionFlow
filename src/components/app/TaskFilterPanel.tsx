import { useState } from "react";
import { TaskFilters } from "@/hooks/use-task-filters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Filter,
  Search,
  X,
  Calendar as CalendarIcon,
  SortAsc,
  SortDesc,
  RefreshCcw,
} from "lucide-react";

interface TaskFilterPanelProps {
  filters: TaskFilters;
  onUpdateFilter: <K extends keyof TaskFilters>(
    key: K,
    value: TaskFilters[K],
  ) => void;
  onResetFilters: () => void;
  filterCount: number;
  availableTags: string[];
}

export function TaskFilterPanel({
  filters,
  onUpdateFilter,
  onResetFilters,
  filterCount,
  availableTags,
}: TaskFilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState<"from" | "to" | null>(
    null,
  );

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onUpdateFilter("tags", newTags);
  };

  const clearDateRange = () => {
    onUpdateFilter("dateRange", {});
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks by title, description, or tags..."
          value={filters.search}
          onChange={(e) => onUpdateFilter("search", e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Quick Filters Row */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.type}
          onValueChange={(value: TaskFilters["type"]) =>
            onUpdateFilter("type", value)
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="brain">🧠 Brain</SelectItem>
            <SelectItem value="admin">📋 Admin</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value: TaskFilters["status"]) =>
            onUpdateFilter("status", value)
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">⏳ Pending</SelectItem>
            <SelectItem value="completed">✅ Completed</SelectItem>
            <SelectItem value="overdue">🔴 Overdue</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.priority}
          onValueChange={(value: TaskFilters["priority"]) =>
            onUpdateFilter("priority", value)
          }
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">🔥 High</SelectItem>
            <SelectItem value="medium">⚡ Medium</SelectItem>
            <SelectItem value="low">🌱 Low</SelectItem>
          </SelectContent>
        </Select>

        {/* Advanced Filters Toggle */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Advanced
              {filterCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                >
                  {filterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Advanced Filters</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onResetFilters}
                  disabled={filterCount === 0}
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>

              {/* Period Filter */}
              <div>
                <Label className="text-sm font-medium">Period</Label>
                <Select
                  value={filters.period}
                  onValueChange={(value: TaskFilters["period"]) =>
                    onUpdateFilter("period", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Periods</SelectItem>
                    <SelectItem value="morning">🌅 Morning</SelectItem>
                    <SelectItem value="afternoon">🌆 Afternoon</SelectItem>
                    <SelectItem value="laterbird">🦅 Later Bird</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div>
                <Label className="text-sm font-medium">Date Range</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Popover
                    open={datePickerOpen === "from"}
                    onOpenChange={(open) =>
                      setDatePickerOpen(open ? "from" : null)
                    }
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start text-left font-normal"
                      >
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {filters.dateRange.from
                          ? filters.dateRange.from.toLocaleDateString()
                          : "From"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.from}
                        onSelect={(date) => {
                          onUpdateFilter("dateRange", {
                            ...filters.dateRange,
                            from: date,
                          });
                          setDatePickerOpen(null);
                        }}
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover
                    open={datePickerOpen === "to"}
                    onOpenChange={(open) =>
                      setDatePickerOpen(open ? "to" : null)
                    }
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="justify-start text-left font-normal"
                      >
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        {filters.dateRange.to
                          ? filters.dateRange.to.toLocaleDateString()
                          : "To"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.to}
                        onSelect={(date) => {
                          onUpdateFilter("dateRange", {
                            ...filters.dateRange,
                            to: date,
                          });
                          setDatePickerOpen(null);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {(filters.dateRange.from || filters.dateRange.to) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearDateRange}
                    className="mt-1 h-6 px-2 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear dates
                  </Button>
                )}
              </div>

              {/* Tags Filter */}
              {availableTags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {availableTags.slice(0, 10).map((tag) => (
                      <Badge
                        key={tag}
                        variant={
                          filters.tags.includes(tag) ? "default" : "outline"
                        }
                        className="cursor-pointer text-xs"
                        onClick={() => handleTagToggle(tag)}
                      >
                        #{tag}
                        {filters.tags.includes(tag) && (
                          <X className="h-3 w-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Sort Controls */}
        <div className="flex items-center space-x-1 ml-auto">
          <Select
            value={filters.sortBy}
            onValueChange={(value: TaskFilters["sortBy"]) =>
              onUpdateFilter("sortBy", value)
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="timeBlock">Time Block</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onUpdateFilter(
                "sortOrder",
                filters.sortOrder === "asc" ? "desc" : "asc",
              )
            }
          >
            {filters.sortOrder === "asc" ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {filterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.search && (
            <Badge variant="secondary" className="text-xs">
              Search: "{filters.search}"
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => onUpdateFilter("search", "")}
              />
            </Badge>
          )}
          {filters.type !== "all" && (
            <Badge variant="secondary" className="text-xs">
              Type: {filters.type}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => onUpdateFilter("type", "all")}
              />
            </Badge>
          )}
          {filters.status !== "all" && (
            <Badge variant="secondary" className="text-xs">
              Status: {filters.status}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => onUpdateFilter("status", "all")}
              />
            </Badge>
          )}
          {filters.priority !== "all" && (
            <Badge variant="secondary" className="text-xs">
              Priority: {filters.priority}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => onUpdateFilter("priority", "all")}
              />
            </Badge>
          )}
          {filters.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              #{tag}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => handleTagToggle(tag)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
