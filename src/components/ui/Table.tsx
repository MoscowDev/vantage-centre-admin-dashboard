import React from 'react';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ className, ...props }) => (
  <div className="w-full overflow-x-auto border border-border rounded-[8px] bg-surface">
    <table className={`w-full text-left border-collapse text-sm text-ink ${className || ''}`} {...props} />
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <thead className={`bg-canvas border-b border-border text-[10px] font-bold text-muted uppercase tracking-widest ${className || ''}`} {...props} />
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <tbody className={`divide-y divide-border ${className || ''}`} {...props} />
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className, ...props }) => (
  <tr className={`hover:bg-canvas/70 transition-colors ${className || ''}`} {...props} />
);

export const TableHeadCell: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <th className={`px-6 py-4 font-bold ${className || ''}`} {...props} />
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <td className={`px-6 py-4 align-middle ${className || ''}`} {...props} />
);
