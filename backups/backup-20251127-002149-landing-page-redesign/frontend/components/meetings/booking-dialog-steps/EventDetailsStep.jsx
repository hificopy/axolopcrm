import { useState } from "react";
import { Calendar, Clock, HelpCircle } from "lucide-react";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { ColorPickerPopover } from "../ColorPickerPopover";

export default function EventDetailsStep({ formData, onChange, errors = {} }) {
  const handleFieldChange = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Event Details
        </h3>

        {/* Event Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Event Name *
          </Label>
          <Input
            id="name"
            value={formData.name || ""}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            placeholder="e.g., 30-Minute Consultation"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <HelpCircle className="w-4 h-4" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label htmlFor="slug" className="text-sm font-medium">
            URL Slug *
          </Label>
          <Input
            id="slug"
            value={formData.slug || ""}
            onChange={(e) => handleFieldChange("slug", e.target.value)}
            placeholder="auto-generated-unique-id"
            className={errors.slug ? "border-red-500" : ""}
          />
          {errors.slug && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <HelpCircle className="w-4 h-4" />
              {errors.slug}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => handleFieldChange("description", e.target.value)}
            placeholder="What will this meeting be about?"
            rows={3}
          />
        </div>

        {/* Internal Note */}
        <div className="space-y-2">
          <Label htmlFor="internalNote" className="text-sm font-medium">
            Internal Note
          </Label>
          <Textarea
            id="internalNote"
            value={formData.internalNote || ""}
            onChange={(e) => handleFieldChange("internalNote", e.target.value)}
            placeholder="Notes for internal team use only"
            rows={2}
          />
        </div>

        {/* Brand Color */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Brand Color</Label>
          <ColorPickerPopover
            color={formData.color || "#761B14"}
            onChange={(color) => handleFieldChange("color", color)}
          />
        </div>
      </div>
    </div>
  );
}
