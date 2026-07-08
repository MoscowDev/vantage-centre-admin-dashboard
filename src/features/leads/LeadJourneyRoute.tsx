import React from 'react';
import type { LeadStatus } from '../../api/leads';

interface LeadJourneyRouteProps {
  status: LeadStatus;
  interactive?: boolean;
  onStatusSelect?: (status: LeadStatus) => void;
}

export const LeadJourneyRoute: React.FC<LeadJourneyRouteProps> = ({
  status,
  interactive = false,
  onStatusSelect,
}) => {
  const stages: { key: LeadStatus; label: string }[] = [
    { key: 'New', label: 'New' },
    { key: 'Contacted', label: 'Contacted' },
    { key: 'In Progress', label: 'In Progress' },
    { key: 'Converted', label: 'Converted' },
    { key: 'Lost', label: 'Lost' },
  ];

  let activeIndex = 0;
  if (status === 'Contacted') activeIndex = 1;
  else if (status === 'In Progress') activeIndex = 2;
  else if (status === 'Converted') activeIndex = 3;
  else if (status === 'Lost') activeIndex = 4;

  const progressClass =
    activeIndex === 0 ? 'w-0' : activeIndex === 1 ? 'w-[25%]' : activeIndex === 2 ? 'w-[50%]' : activeIndex === 3 ? 'w-[75%]' : 'w-full';

  const renderDot = (index: number, label: string, key: LeadStatus) => {
    const isCurrent = index === activeIndex;
    const isCompleted = index < activeIndex;
    const isTerminal = index === 3 || index === 4;

    let nodeClassName = 'route-node';
    if (isCurrent) {
      nodeClassName += ' route-node-current';
    } else if (isCompleted) {
      nodeClassName += ' route-node-complete';
    }

    if (isTerminal && isCurrent) {
      nodeClassName += status === 'Converted' ? ' route-node-terminal-success' : ' route-node-terminal-danger';
    }

    const handleClick = () => {
      if (interactive && onStatusSelect) {
        onStatusSelect(key);
      }
    };

    return (
      <div key={label} className="relative z-10 flex flex-col items-center" title={`Stage: ${label}`}>
        <button
          type="button"
          onClick={handleClick}
          disabled={!interactive}
          className={`${nodeClassName} ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
          aria-label={`Journey step: ${label}`}
        />
      </div>
    );
  };

  return (
    <div className="flex w-full flex-col">
      <div className="relative flex h-4 w-full items-center justify-between">
        <div className="route-track" />
        <div className={`route-fill ${progressClass}`} />
        {stages.map((stage, idx) => renderDot(idx, stage.label, stage.key))}
      </div>
    </div>
  );
};
