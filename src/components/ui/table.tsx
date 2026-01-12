import * as React from 'react'
import { cn } from '@/lib/utils'

export const Table = ({ children, className }: any) => (
  <div className="w-full overflow-auto">
    <table className={cn('w-full border-collapse text-left', className)}>{children}</table>
  </div>
)

export const TableHeader = ({ children, className }: any) => (
  <thead className={cn('bg-white/5 border-b border-white/10', className)}>{children}</thead>
)

export const TableBody = ({ children, className }: any) => (
  <tbody className={cn('divide-y divide-white/5', className)}>{children}</tbody>
)

export const TableRow = ({ children, className }: any) => (
  <tr className={cn('hover:bg-white/5 transition-colors', className)}>{children}</tr>
)

export const TableHead = ({ children, className }: any) => (
  <th
    className={cn(
      'p-4 text-[10px] font-black uppercase tracking-widest text-neutral-400',
      className
    )}
  >
    {children}
  </th>
)

export const TableCell = ({ children, className }: any) => (
  <td className={cn('p-4 text-[11px] font-mono', className)}>{children}</td>
)
