import React from 'react';
import FlowBuilder from '../components/email-marketing/FlowBuilder';

const WorkflowBuilder = () => {
  return (
    <div className="h-screen flex flex-col">
      <div className="border-b p-4">
        <h1 className="text-xl font-bold">Workflow Builder</h1>
        <p className="text-sm text-gray-500">Create automated workflows to nurture your leads and customers</p>
      </div>
      <div className="flex-1">
        <FlowBuilder />
      </div>
    </div>
  );
};

export default WorkflowBuilder;