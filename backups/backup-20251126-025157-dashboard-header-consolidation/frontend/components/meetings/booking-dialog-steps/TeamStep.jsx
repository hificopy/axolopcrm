import { useState } from "react";
import { Users, HelpCircle } from "lucide-react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Switch } from "../../ui/switch";

export default function TeamStep({ formData, onChange, errors = {} }) {
  const handleFieldChange = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          Team & Assignment
        </h3>

        {/* Assignment Type */}
        <div className="space-y-2">
          <Label htmlFor="assignmentType" className="text-sm font-medium">
            Assignment Type *
          </Label>
          <Select
            value={formData.assignmentType || "round_robin"}
            onValueChange={(value) =>
              handleFieldChange("assignmentType", value)
            }
          >
            <SelectTrigger
              className={errors.assignmentType ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select assignment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="round_robin">Round Robin</SelectItem>
              <SelectItem value="load_balanced">Load Balanced</SelectItem>
              <SelectItem value="manual">Manual Assignment</SelectItem>
              <SelectItem value="first_available">First Available</SelectItem>
            </SelectContent>
          </Select>
          {errors.assignmentType && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <HelpCircle className="w-4 h-4" />
              {errors.assignmentType}
            </p>
          )}
        </div>

        {/* Host Priority (for load balanced) */}
        {formData.assignmentType === "load_balanced" && (
          <div className="space-y-2">
            <Label htmlFor="hostPriority" className="text-sm font-medium">
              Host Priority
            </Label>
            <Select
              value={formData.hostPriority || "optimize_manually"}
              onValueChange={(value) =>
                handleFieldChange("hostPriority", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="optimize_manually">
                  Optimize Manually
                </SelectItem>
                <SelectItem value="equal_distribution">
                  Equal Distribution
                </SelectItem>
                <SelectItem value="least_booked">Least Booked First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Team Members */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Team Members</Label>
          <p className="text-sm text-gray-600">
            Select team members who can be assigned to bookings from this link.
            Leave empty to assign to yourself.
          </p>

          {/* This would typically integrate with a team member selector */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">Team Member Selection</p>
            <p className="text-sm text-gray-500">
              Team member integration will be available in the next update.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Current setting: {formData.hosts?.length || 0} team members
              selected
            </p>
          </div>
        </div>

        {/* Assignment Type Descriptions */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Assignment Types</h4>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Round Robin:</strong> Rotates assignments evenly among
              team members
            </div>
            <div>
              <strong>Load Balanced:</strong> Assigns to team member with fewest
              current bookings
            </div>
            <div>
              <strong>Manual Assignment:</strong> Allows manual selection of
              assignee for each booking
            </div>
            <div>
              <strong>First Available:</strong> Assigns to first available team
              member
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Advanced Settings</h4>

          {/* Allow Reschedule */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allowReschedule" className="text-sm font-medium">
                Allow Rescheduling
              </Label>
              <p className="text-xs text-gray-500">
                Let attendees reschedule their own bookings
              </p>
            </div>
            <Switch
              id="allowReschedule"
              checked={formData.allowReschedule !== false}
              onCheckedChange={(checked) =>
                handleFieldChange("allowReschedule", checked)
              }
            />
          </div>

          {/* Prevent Duplicate Bookings */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="preventDuplicateBookings"
                className="text-sm font-medium"
              >
                Prevent Duplicate Bookings
              </Label>
              <p className="text-xs text-gray-500">
                Block same email from booking multiple times
              </p>
            </div>
            <Switch
              id="preventDuplicateBookings"
              checked={formData.preventDuplicateBookings || false}
              onCheckedChange={(checked) =>
                handleFieldChange("preventDuplicateBookings", checked)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
