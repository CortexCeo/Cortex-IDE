import React from 'react';
import { Button } from '@/components/ui/button';
import { ResearchItem } from './initialize';
import { ChevronLeft, FileText, ClipboardCheck, HourglassIcon } from 'lucide-react';

interface ResearchHistoryProps {
  items: ResearchItem[];
  onBackClick: () => void;
  onItemClick: (item: ResearchItem) => void;
  onDeleteItem: (item: ResearchItem, e: React.MouseEvent) => void;
}

/**
 * Groups research items by time periods (Today, Yesterday, Last Week, etc.)
 */
export const ResearchHistory: React.FC<ResearchHistoryProps> = ({ 
  items, 
  onItemClick, 
  onDeleteItem 
}) => {
  // Group items by time period
  const groupedItems = groupItemsByTimePeriod(items);
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-3">
        <h3 className="text-base font-medium px-2">Research History</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3">
        {Object.entries(groupedItems).map(([timePeriod, periodItems]) => (
          <div key={timePeriod} className="mb-6">
            <h4 className="text-sm font-medium mb-3 px-2">{timePeriod}</h4>
            <div className="space-y-3">
              {periodItems.map((item) => (
                <div key={item._id || item.id} className="flex items-center group relative">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm h-10 px-2 overflow-hidden group-hover:pr-8"
                    title={item.topic}
                    onClick={() => onItemClick(item)}
                  >
                    {getItemStatusIcon(item)}
                    <div className="flex-1 flex flex-col items-start">
                      <span className="truncate max-w-[13vw] overflow-hidden text-ellipsis whitespace-nowrap">
                        {item.topic}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {getItemStatusLabel(item)}
                      </span>
                    </div>
                  </Button>
                  <button 
                    className="opacity-0 group-hover:opacity-100 absolute right-2 p-1 rounded-full hover:bg-destructive/10 transition-opacity"
                    title="Delete research"
                    onClick={(e) => onDeleteItem(item, e)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3.5 w-3.5 text-destructive"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      <line x1="10" x2="10" y1="11" y2="17" />
                      <line x1="14" x2="14" y1="11" y2="17" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {items.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No research items found
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Helper function to get the appropriate icon for a research item based on its status
 */
const getItemStatusIcon = (item: ResearchItem) => {
  switch (item.status) {
    case 'in_planning':
      return <ClipboardCheck className="h-4 w-4 mr-2 text-amber-500" />;
    case 'in_progress':
      return <HourglassIcon className="h-4 w-4 mr-2 text-blue-500" />;
    case 'completed':
      return <FileText className="h-4 w-4 mr-2 text-green-500" />;
    default:
      return <FileText className="h-4 w-4 mr-2 text-muted-foreground" />;
  }
};

/**
 * Helper function to get a human-readable label for a research item status
 */
const getItemStatusLabel = (item: ResearchItem) => {
  switch (item.status) {
    case 'to_be_started':
      return 'Not Started';
    case 'in_planning':
      return 'Planning';
    case 'in_progress':
      return 'In Progress';
    case 'completed':
      return 'Completed';
    default:
      return item.status;
  }
};

/**
 * Groups research items by time period (Today, Yesterday, Last Week, etc.)
 */
const groupItemsByTimePeriod = (items: ResearchItem[]) => {
  const grouped: Record<string, ResearchItem[]> = {
    'Today': [],
    'Yesterday': [],
    'This Week': [],
    'Last Week': [],
    'This Month': [],
    'Older': []
  };
  
  // Sort items by updated_at or created_at date (newest first)
  const sortedItems = [...items].sort((a, b) => {
    const dateA = a.updated_at ? new Date(a.updated_at) : new Date(a.created_at || 0);
    const dateB = b.updated_at ? new Date(b.updated_at) : new Date(b.created_at || 0);
    return dateB.getTime() - dateA.getTime();
  });
  
  // Group items by time period
  sortedItems.forEach(item => {
    const date = item.updated_at ? new Date(item.updated_at) : new Date(item.created_at || 0);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      grouped['Today'].push(item);
    } else if (diffDays === 1) {
      grouped['Yesterday'].push(item);
    } else if (diffDays < 7) {
      grouped['This Week'].push(item);
    } else if (diffDays < 14) {
      grouped['Last Week'].push(item);
    } else if (diffDays < 30) {
      grouped['This Month'].push(item);
    } else {
      grouped['Older'].push(item);
    }
  });
  
  // Remove empty time periods
  Object.keys(grouped).forEach(key => {
    if (grouped[key].length === 0) {
      delete grouped[key];
    }
  });
  
  return grouped;
};
