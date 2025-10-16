import * as React from 'react';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { ChevronDown, Circle, CheckCircle2, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const ChainOfThought = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Root
    ref={ref}
    className={cn('rounded-lg border border-slate-200 bg-white', className)}
    {...props}
  >
    {children}
  </CollapsiblePrimitive.Root>
));
ChainOfThought.displayName = 'ChainOfThought';

const ChainOfThoughtHeader = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Trigger
    ref={ref}
    className={cn(
      'flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-slate-50 transition-colors group',
      className
    )}
    {...props}
  >
    <span className="text-slate-700">{children || 'Chain of Thought'}</span>
    <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
  </CollapsiblePrimitive.Trigger>
));
ChainOfThoughtHeader.displayName = 'ChainOfThoughtHeader';

const ChainOfThoughtContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className={cn(
      'border-t border-slate-200 px-4 py-3 space-y-3',
      className
    )}
    {...props}
  >
    {children}
  </CollapsiblePrimitive.Content>
));
ChainOfThoughtContent.displayName = 'ChainOfThoughtContent';

interface ChainOfThoughtStepProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  label: string;
  description?: string;
  status?: 'pending' | 'active' | 'complete';
}

const ChainOfThoughtStep = React.forwardRef<HTMLDivElement, ChainOfThoughtStepProps>(
  ({ className, icon: Icon, label, description, status = 'complete', children, ...props }, ref) => {
    const StatusIcon = status === 'complete' ? CheckCircle2 : Circle;
    const iconColor = status === 'complete' ? 'text-green-600' : status === 'active' ? 'text-blue-600' : 'text-slate-300';

    return (
      <div ref={ref} className={cn('flex gap-3', className)} {...props}>
        <div className="flex-shrink-0 mt-0.5">
          {Icon ? (
            <Icon className={cn('h-4 w-4', iconColor)} />
          ) : (
            <StatusIcon className={cn('h-4 w-4', iconColor)} />
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <p className="text-sm text-slate-900">{label}</p>
            {description && (
              <p className="text-xs text-slate-600 mt-1">{description}</p>
            )}
          </div>
          {children}
        </div>
      </div>
    );
  }
);
ChainOfThoughtStep.displayName = 'ChainOfThoughtStep';

const ChainOfThoughtSearchResults = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-wrap gap-2', className)}
    {...props}
  >
    {children}
  </div>
));
ChainOfThoughtSearchResults.displayName = 'ChainOfThoughtSearchResults';

const ChainOfThoughtSearchResult = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-slate-100 text-slate-700 border border-slate-200',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
ChainOfThoughtSearchResult.displayName = 'ChainOfThoughtSearchResult';

interface ChainOfThoughtImageProps extends React.HTMLAttributes<HTMLDivElement> {
  caption?: string;
}

const ChainOfThoughtImage = React.forwardRef<HTMLDivElement, ChainOfThoughtImageProps>(
  ({ className, caption, children, ...props }, ref) => (
    <div ref={ref} className={cn('space-y-2', className)} {...props}>
      <div className="rounded-lg overflow-hidden border border-slate-200">
        {children}
      </div>
      {caption && (
        <p className="text-xs text-slate-600">{caption}</p>
      )}
    </div>
  )
);
ChainOfThoughtImage.displayName = 'ChainOfThoughtImage';

export {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
  ChainOfThoughtSearchResults,
  ChainOfThoughtSearchResult,
  ChainOfThoughtImage,
};
