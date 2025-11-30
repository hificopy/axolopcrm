import { useState } from "react";
import { Clock, HelpCircle, AlertTriangle } from "lucide-react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

export default function LimitationsStep({ formData, onChange, errors = {} }) {
  const handleFieldChange = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Booking Limitations
        </h3>

        {/* Minimum Notice Hours */}
        <div className="space-y-2">
          <Label htmlFor="minNoticeHours" className="text-sm font-medium">
            Minimum Notice (hours)
          </Label>
          <Input
            id="minNoticeHours"
            type="number"
            value={formData.minNoticeHours || 1}
            onChange={(e) =>
              handleFieldChange("minNoticeHours", parseInt(e.target.value))
            }
            placeholder="1"
            min="0"
            max="168"
            className={errors.minNoticeHours ? "border-red-500" : ""}
          />
          {errors.minNoticeHours && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <HelpCircle className="w-4 h-4" />
              {errors.minNoticeHours}
            </p>
          )}
          <p className="text-xs text-gray-500">
            How many hours in advance users must book
          </p>
        </div>

        {/* Maximum Bookings Per Day */}
        <div className="space-y-2">
          <Label htmlFor="maxBookingsPerDay" className="text-sm font-medium">
            Maximum Bookings Per Day
          </Label>
          <Input
            id="maxBookingsPerDay"
            type="number"
            value={formData.maxBookingsPerDay || ""}
            onChange={(e) =>
              handleFieldChange(
                "maxBookingsPerDay",
                e.target.value ? parseInt(e.target.value) : null,
              )
            }
            placeholder="No limit"
            min="1"
            max="50"
            className={errors.maxBookingsPerDay ? "border-red-500" : ""}
          />
          {errors.maxBookingsPerDay && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <HelpCircle className="w-4 h-4" />
              {errors.maxBookingsPerDay}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Leave empty for no daily limit
          </p>
        </div>

        {/* Booking Window Settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Booking Window</h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bookingStartDate" className="text-sm font-medium">
                Start Date
              </Label>
              <Input
                id="bookingStartDate"
                type="date"
                value={formData.bookingStartDate || ""}
                onChange={(e) =>
                  handleFieldChange("bookingStartDate", e.target.value)
                }
                placeholder="No restriction"
              />
              <p className="text-xs text-gray-500">
                Earliest date for bookings
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bookingEndDate" className="text-sm font-medium">
                End Date
              </Label>
              <Input
                id="bookingEndDate"
                type="date"
                value={formData.bookingEndDate || ""}
                onChange={(e) =>
                  handleFieldChange("bookingEndDate", e.target.value)
                }
                placeholder="No restriction"
              />
              <p className="text-xs text-gray-500">Latest date for bookings</p>
            </div>
          </div>
        </div>

        {/* Time Restrictions */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Time Restrictions</h4>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="earliestBookingTime"
                className="text-sm font-medium"
              >
                Earliest Booking Time
              </Label>
              <Input
                id="earliestBookingTime"
                type="time"
                value={formData.earliestBookingTime || ""}
                onChange={(e) =>
                  handleFieldChange("earliestBookingTime", e.target.value)
                }
                placeholder="No restriction"
              />
              <p className="text-xs text-gray-500">
                Earliest time allowed for bookings
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="latestBookingTime"
                className="text-sm font-medium"
              >
                Latest Booking Time
              </Label>
              <Input
                id="latestBookingTime"
                type="time"
                value={formData.latestBookingTime || ""}
                onChange={(e) =>
                  handleFieldChange("latestBookingTime", e.target.value)
                }
                placeholder="No restriction"
              />
              <p className="text-xs text-gray-500">
                Latest time allowed for bookings
              </p>
            </div>
          </div>
        </div>

        {/* Advanced Restrictions */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Advanced Restrictions</h4>

          {/* Blackout Dates */}
          <div className="space-y-2">
            <Label htmlFor="blackoutDates" className="text-sm font-medium">
              Blackout Dates
            </Label>
            <Input
              id="blackoutDates"
              value={formData.blackoutDates || ""}
              onChange={(e) =>
                handleFieldChange("blackoutDates", e.target.value)
              }
              placeholder="2024-12-25, 2024-12-26"
              className={errors.blackoutDates ? "border-red-500" : ""}
            />
            {errors.blackoutDates && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <HelpCircle className="w-4 h-4" />
                {errors.blackoutDates}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Comma-separated dates when bookings are not allowed
            </p>
          </div>

          {/* Blocked Domains */}
          <div className="space-y-2">
            <Label htmlFor="blockedDomains" className="text-sm font-medium">
              Blocked Email Domains
            </Label>
            <Input
              id="blockedDomains"
              value={formData.blockedDomains || ""}
              onChange={(e) =>
                handleFieldChange("blockedDomains", e.target.value)
              }
              placeholder="spam.com, temporary.com"
              className={errors.blockedDomains ? "border-red-500" : ""}
            />
            {errors.blockedDomains && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <HelpCircle className="w-4 h-4" />
                {errors.blockedDomains}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Comma-separated domains to block bookings from
            </p>
          </div>
        </div>

        {/* Warning Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-900 mb-1">
                Important Notice
              </h4>
              <p className="text-sm text-yellow-800">
                Setting too many restrictions may reduce booking conversion
                rates. Consider using minimal limitations for better user
                experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
