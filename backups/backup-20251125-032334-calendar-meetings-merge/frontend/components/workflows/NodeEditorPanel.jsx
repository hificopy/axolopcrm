import React from 'react';
import { XCircle, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

const NodeEditorPanel = ({ selectedNode, selectedEdge, nodes, onUpdateNode, onUpdateEdge, onClose }) => {
  if (selectedNode) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-crm-text-primary">Node Settings</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XCircle className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {/* Common Fields */}
          <div>
            <Label className="text-sm font-medium">Label</Label>
            <Input
              value={selectedNode.data.label}
              onChange={(e) => onUpdateNode(selectedNode.id, { label: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
              value={selectedNode.data.description || ''}
              onChange={(e) => onUpdateNode(selectedNode.id, { description: e.target.value })}
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Trigger Configuration */}
          {selectedNode.type === 'trigger' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Trigger Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Trigger Type</Label>
                  <Select
                    value={selectedNode.data.triggerType}
                    onValueChange={(value) => onUpdateNode(selectedNode.id, { triggerType: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LEAD_CREATED">Lead Created</SelectItem>
                      <SelectItem value="FORM_SUBMITTED">Form Submitted</SelectItem>
                      <SelectItem value="EMAIL_OPENED">Email Opened</SelectItem>
                      <SelectItem value="EMAIL_CLICKED">Email Clicked</SelectItem>
                      <SelectItem value="PAGE_VISITED">Page Visited</SelectItem>
                      <SelectItem value="API_CALL">API Call</SelectItem>
                      <SelectItem value="SCHEDULED_TIME">Scheduled Time</SelectItem>
                      <SelectItem value="WEBHOOK_RECEIVED">Webhook Received</SelectItem>
                      <SelectItem value="TAG_ADDED">Tag Added</SelectItem>
                      <SelectItem value="TAG_REMOVED">Tag Removed</SelectItem>
                      <SelectItem value="OPPORTUNITY_CREATE">Opportunity Created</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Configuration */}
          {selectedNode.type === 'action' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Action Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Action Type</Label>
                  <Select
                    value={selectedNode.data.actionType}
                    onValueChange={(value) => onUpdateNode(selectedNode.id, { actionType: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMAIL">Send Email</SelectItem>
                      <SelectItem value="SEND_SMS">Send SMS</SelectItem>
                      <SelectItem value="TAG_ADD">Add Tag</SelectItem>
                      <SelectItem value="TAG_REMOVE">Remove Tag</SelectItem>
                      <SelectItem value="FIELD_UPDATE">Update Field</SelectItem>
                      <SelectItem value="TASK_CREATE">Create Task</SelectItem>
                      <SelectItem value="CREATE_CONTACT">Create Contact</SelectItem>
                      <SelectItem value="CREATE_DEAL">Create Deal</SelectItem>
                      <SelectItem value="WEBHOOK">Call Webhook</SelectItem>
                      <SelectItem value="INTERNAL_NOTIFICATION">Send Notification</SelectItem>
                      <SelectItem value="ASSIGN_TO_USER">Assign to User</SelectItem>
                      <SelectItem value="LEAD_SCORE_UPDATE">Update Lead Score</SelectItem>
                      <SelectItem value="PIPELINE_MOVE">Move Pipeline Stage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Email Action Fields */}
                {selectedNode.data.actionType === 'EMAIL' && (
                  <>
                    <div>
                      <Label className="text-xs">Subject</Label>
                      <Input
                        value={selectedNode.data.subject || ''}
                        onChange={(e) => onUpdateNode(selectedNode.id, { subject: e.target.value })}
                        className="mt-1"
                        placeholder="Email subject"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Email Template ID</Label>
                      <Input
                        value={selectedNode.data.emailTemplateId || ''}
                        onChange={(e) => onUpdateNode(selectedNode.id, { emailTemplateId: e.target.value })}
                        className="mt-1"
                        placeholder="template-id"
                      />
                    </div>
                  </>
                )}

                {/* SMS Action Fields */}
                {selectedNode.data.actionType === 'SEND_SMS' && (
                  <div>
                    <Label className="text-xs">Message</Label>
                    <Textarea
                      value={selectedNode.data.message || ''}
                      onChange={(e) => onUpdateNode(selectedNode.id, { message: e.target.value })}
                      className="mt-1"
                      placeholder="SMS message"
                      rows={3}
                    />
                  </div>
                )}

                {/* Tag Action Fields */}
                {(selectedNode.data.actionType === 'TAG_ADD' || selectedNode.data.actionType === 'TAG_REMOVE') && (
                  <div>
                    <Label className="text-xs">Tag Name</Label>
                    <Input
                      value={selectedNode.data.tagName || ''}
                      onChange={(e) => onUpdateNode(selectedNode.id, { tagName: e.target.value })}
                      className="mt-1"
                      placeholder="Enter tag name"
                    />
                  </div>
                )}

                {/* Field Update Fields */}
                {selectedNode.data.actionType === 'FIELD_UPDATE' && (
                  <>
                    <div>
                      <Label className="text-xs">Field Name</Label>
                      <Input
                        value={selectedNode.data.fieldName || ''}
                        onChange={(e) => onUpdateNode(selectedNode.id, { fieldName: e.target.value })}
                        className="mt-1"
                        placeholder="e.g., status"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Field Value</Label>
                      <Input
                        value={selectedNode.data.fieldValue || ''}
                        onChange={(e) => onUpdateNode(selectedNode.id, { fieldValue: e.target.value })}
                        className="mt-1"
                        placeholder="New value"
                      />
                    </div>
                  </>
                )}

                {/* Webhook Fields */}
                {selectedNode.data.actionType === 'WEBHOOK' && (
                  <>
                    <div>
                      <Label className="text-xs">Webhook URL</Label>
                      <Input
                        value={selectedNode.data.webhookUrl || ''}
                        onChange={(e) => onUpdateNode(selectedNode.id, { webhookUrl: e.target.value })}
                        className="mt-1"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Method</Label>
                      <Select
                        value={selectedNode.data.webhookMethod || 'POST'}
                        onValueChange={(value) => onUpdateNode(selectedNode.id, { webhookMethod: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Condition Configuration */}
          {selectedNode.type === 'condition' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Condition Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Condition Type</Label>
                  <Select
                    value={selectedNode.data.conditionType || 'FIELD_COMPARE'}
                    onValueChange={(value) => onUpdateNode(selectedNode.id, { conditionType: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIELD_COMPARE">Field Comparison</SelectItem>
                      <SelectItem value="TAG_CHECK">Tag Check</SelectItem>
                      <SelectItem value="EMAIL_STATUS">Email Status</SelectItem>
                      <SelectItem value="LEAD_SCORE">Lead Score</SelectItem>
                      <SelectItem value="MULTI_FIELD">Multiple Fields</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedNode.data.conditionType === 'FIELD_COMPARE' && (
                  <>
                    <div>
                      <Label className="text-xs">Field Name</Label>
                      <Input
                        value={selectedNode.data.field || ''}
                        onChange={(e) => onUpdateNode(selectedNode.id, { field: e.target.value })}
                        className="mt-1"
                        placeholder="e.g., status"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Operator</Label>
                      <Select
                        value={selectedNode.data.operator || 'equals'}
                        onValueChange={(value) => onUpdateNode(selectedNode.id, { operator: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="not_equals">Not Equals</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="not_contains">Not Contains</SelectItem>
                          <SelectItem value="greater_than">Greater Than</SelectItem>
                          <SelectItem value="less_than">Less Than</SelectItem>
                          <SelectItem value="is_empty">Is Empty</SelectItem>
                          <SelectItem value="is_not_empty">Is Not Empty</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Value</Label>
                      <Input
                        value={selectedNode.data.value || ''}
                        onChange={(e) => onUpdateNode(selectedNode.id, { value: e.target.value })}
                        className="mt-1"
                        placeholder="Comparison value"
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Delay Configuration */}
          {selectedNode.type === 'delay' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Delay Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Delay Type</Label>
                  <Select
                    value={selectedNode.data.delayType || 'TIME_DELAY'}
                    onValueChange={(value) => onUpdateNode(selectedNode.id, { delayType: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TIME_DELAY">Time Delay</SelectItem>
                      <SelectItem value="WAIT_UNTIL">Wait Until</SelectItem>
                      <SelectItem value="WAIT_FOR_EVENT">Wait for Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedNode.data.delayType === 'TIME_DELAY' && (
                  <>
                    <div>
                      <Label className="text-xs">Delay Amount</Label>
                      <Input
                        type="number"
                        value={selectedNode.data.delayAmount || 1}
                        onChange={(e) => onUpdateNode(selectedNode.id, { delayAmount: parseInt(e.target.value) })}
                        className="mt-1"
                        min="1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Delay Unit</Label>
                      <Select
                        value={selectedNode.data.delayUnit || 'hours'}
                        onValueChange={(value) => onUpdateNode(selectedNode.id, { delayUnit: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Split Test Configuration */}
          {selectedNode.type === 'split' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">A/B Split Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Variant A (%)</Label>
                  <Input
                    type="number"
                    value={selectedNode.data.splitPercentageA || 50}
                    onChange={(e) => onUpdateNode(selectedNode.id, { splitPercentageA: parseInt(e.target.value) })}
                    className="mt-1"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <Label className="text-xs">Variant B (%)</Label>
                  <Input
                    type="number"
                    value={selectedNode.data.splitPercentageB || 50}
                    onChange={(e) => onUpdateNode(selectedNode.id, { splitPercentageB: parseInt(e.target.value) })}
                    className="mt-1"
                    min="0"
                    max="100"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Goal Configuration */}
          {selectedNode.type === 'goal' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Goal Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Goal Type</Label>
                  <Select
                    value={selectedNode.data.goalType || 'EMAIL_CLICKED'}
                    onValueChange={(value) => onUpdateNode(selectedNode.id, { goalType: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMAIL_CLICKED">Email Clicked</SelectItem>
                      <SelectItem value="FORM_SUBMITTED">Form Submitted</SelectItem>
                      <SelectItem value="PAGE_VISITED">Page Visited</SelectItem>
                      <SelectItem value="PURCHASE_MADE">Purchase Made</SelectItem>
                      <SelectItem value="DEAL_CLOSED">Deal Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  if (selectedEdge) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-crm-text-primary">Connection Settings</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <XCircle className="h-4 w-4" />
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Connection Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">From</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                {nodes.find(n => n.id === selectedEdge.source)?.data.label || selectedEdge.source}
              </div>
            </div>
            <div>
              <Label className="text-xs">To</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded text-sm">
                {nodes.find(n => n.id === selectedEdge.target)?.data.label || selectedEdge.target}
              </div>
            </div>
            <div>
              <Label className="text-xs">Label (optional)</Label>
              <Input
                value={selectedEdge.label || ''}
                onChange={(e) => onUpdateEdge(selectedEdge.id, e.target.value)}
                className="mt-1"
                placeholder="e.g., If Yes"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 text-center py-8 text-crm-text-secondary">
      <GitBranch className="h-12 w-12 mx-auto mb-3 opacity-30" />
      <p className="text-sm">Select a node or connection to edit</p>
      <p className="text-xs mt-2">Click on nodes to view and edit their settings</p>
    </div>
  );
};

export default NodeEditorPanel;
