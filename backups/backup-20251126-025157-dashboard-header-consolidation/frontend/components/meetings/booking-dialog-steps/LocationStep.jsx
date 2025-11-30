import { useState } from "react";
import { Phone, Video, MapPin, HelpCircle } from "lucide-react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

export default function LocationStep({ formData, onChange, errors = {} }) {
  const handleFieldChange = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  const handleLocationDetailsChange = (field, value) => {
    onChange({
      ...formData,
      locationDetails: {
        ...formData.locationDetails,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Location Details
        </h3>

        {/* Location Type */}
        <div className="space-y-2">
          <Label htmlFor="locationType" className="text-sm font-medium">
            Location Type *
          </Label>
          <Select
            value={formData.locationType || "phone"}
            onValueChange={(value) => handleFieldChange("locationType", value)}
          >
            <SelectTrigger
              className={errors.locationType ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select location type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="phone">Phone Call</SelectItem>
              <SelectItem value="video">Video Call</SelectItem>
              <SelectItem value="in_person">In Person</SelectItem>
              <SelectItem value="custom">Custom Location</SelectItem>
            </SelectContent>
          </Select>
          {errors.locationType && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <HelpCircle className="w-4 h-4" />
              {errors.locationType}
            </p>
          )}
        </div>

        {/* Phone Number (for phone calls) */}
        {formData.locationType === "phone" && (
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-sm font-medium">
              Phone Number *
            </Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.locationDetails?.phoneNumber || ""}
              onChange={(e) =>
                handleLocationDetailsChange("phoneNumber", e.target.value)
              }
              placeholder="+1 (555) 123-4567"
              className={errors.phoneNumber ? "border-red-500" : ""}
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <HelpCircle className="w-4 h-4" />
                {errors.phoneNumber}
              </p>
            )}
          </div>
        )}

        {/* Video Call Details */}
        {formData.locationType === "video" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="videoPlatform" className="text-sm font-medium">
                Video Platform *
              </Label>
              <Select
                value={formData.locationDetails?.videoPlatform || "zoom"}
                onValueChange={(value) =>
                  handleLocationDetailsChange("videoPlatform", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select video platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="google_meet">Google Meet</SelectItem>
                  <SelectItem value="teams">Microsoft Teams</SelectItem>
                  <SelectItem value="skype">Skype</SelectItem>
                  <SelectItem value="custom">Custom Link</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="videoUrl" className="text-sm font-medium">
                Video Call URL *
              </Label>
              <Input
                id="videoUrl"
                type="url"
                value={formData.locationDetails?.videoUrl || ""}
                onChange={(e) =>
                  handleLocationDetailsChange("videoUrl", e.target.value)
                }
                placeholder="https://zoom.us/j/123456789"
                className={errors.videoUrl ? "border-red-500" : ""}
              />
              {errors.videoUrl && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <HelpCircle className="w-4 h-4" />
                  {errors.videoUrl}
                </p>
              )}
            </div>
          </div>
        )}

        {/* In Person Location */}
        {formData.locationType === "in_person" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium">
                Address *
              </Label>
              <Textarea
                id="address"
                value={formData.locationDetails?.address || ""}
                onChange={(e) =>
                  handleLocationDetailsChange("address", e.target.value)
                }
                placeholder="123 Main St, City, State 12345"
                rows={3}
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <HelpCircle className="w-4 h-4" />
                  {errors.address}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationNotes" className="text-sm font-medium">
                Location Notes
              </Label>
              <Textarea
                id="locationNotes"
                value={formData.locationDetails?.locationNotes || ""}
                onChange={(e) =>
                  handleLocationDetailsChange("locationNotes", e.target.value)
                }
                placeholder="Parking information, building access, etc."
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Custom Location */}
        {formData.locationType === "custom" && (
          <div className="space-y-2">
            <Label htmlFor="customLocation" className="text-sm font-medium">
              Custom Location Details *
            </Label>
            <Textarea
              id="customLocation"
              value={formData.locationDetails?.customLocation || ""}
              onChange={(e) =>
                handleLocationDetailsChange("customLocation", e.target.value)
              }
              placeholder="Describe where the meeting will take place"
              rows={3}
              className={errors.customLocation ? "border-red-500" : ""}
            />
            {errors.customLocation && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <HelpCircle className="w-4 h-4" />
                {errors.customLocation}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
