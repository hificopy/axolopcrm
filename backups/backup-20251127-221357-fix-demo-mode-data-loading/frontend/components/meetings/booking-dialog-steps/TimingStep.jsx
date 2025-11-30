import { useState } from "react";
import { Clock, Calendar, HelpCircle } from "lucide-react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

export default function TimingStep({ formData, onChange, errors = {} }) {
  const handleFieldChange = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Timing & Availability
        </h3>

        {/* Duration */}
        <div className="space-y-2">
          <Label htmlFor="duration" className="text-sm font-medium">
            Duration (minutes) *
          </Label>
          <Select
            value={formData.duration?.toString() || "30"}
            onValueChange={(value) =>
              handleFieldChange("duration", parseInt(value))
            }
          >
            <SelectTrigger className={errors.duration ? "border-red-500" : ""}>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
              <SelectItem value="90">90 minutes</SelectItem>
              <SelectItem value="120">120 minutes</SelectItem>
            </SelectContent>
          </Select>
          {errors.duration && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <HelpCircle className="w-4 h-4" />
              {errors.duration}
            </p>
          )}
        </div>

        {/* Date Range Type */}
        <div className="space-y-2">
          <Label htmlFor="dateRangeType" className="text-sm font-medium">
            Date Range
          </Label>
          <Select
            value={formData.dateRangeType || "calendar_days"}
            onValueChange={(value) => handleFieldChange("dateRangeType", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select date range type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calendar_days">Calendar Days</SelectItem>
              <SelectItem value="date_range">Specific Date Range</SelectItem>
              <SelectItem value="weekdays">Weekdays Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Value */}
        {formData.dateRangeType === "calendar_days" && (
          <div className="space-y-2">
            <Label htmlFor="dateRangeValue" className="text-sm font-medium">
              Days Ahead
            </Label>
            <Input
              id="dateRangeValue"
              type="number"
              value={formData.dateRangeValue || 14}
              onChange={(e) =>
                handleFieldChange("dateRangeValue", parseInt(e.target.value))
              }
              placeholder="14"
              min="1"
              max="365"
            />
          </div>
        )}

        {/* Start Time Increment */}
        <div className="space-y-2">
          <Label htmlFor="startTimeIncrement" className="text-sm font-medium">
            Start Time Increment
          </Label>
          <Select
            value={formData.startTimeIncrement?.toString() || "15"}
            onValueChange={(value) =>
              handleFieldChange("startTimeIncrement", parseInt(value))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select increment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Time Format */}
        <div className="space-y-2">
          <Label htmlFor="timeFormat" className="text-sm font-medium">
            Time Format
          </Label>
          <Select
            value={formData.timeFormat || "12h"}
            onValueChange={(value) => handleFieldChange("timeFormat", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select time format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
              <SelectItem value="24h">24-hour</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Buffer Times */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bufferBefore" className="text-sm font-medium">
              Buffer Before (minutes)
            </Label>
            <Input
              id="bufferBefore"
              type="number"
              value={formData.bufferBefore || 0}
              onChange={(e) =>
                handleFieldChange("bufferBefore", parseInt(e.target.value))
              }
              placeholder="0"
              min="0"
              max="120"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bufferAfter" className="text-sm font-medium">
              Buffer After (minutes)
            </Label>
            <Input
              id="bufferAfter"
              type="number"
              value={formData.bufferAfter || 0}
              onChange={(e) =>
                handleFieldChange("bufferAfter", parseInt(e.target.value))
              }
              placeholder="0"
              min="0"
              max="120"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
