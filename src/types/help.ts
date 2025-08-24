export interface HelpArticle {
  slug: string;
  title: string;
  bodyMarkdown: string;
  section: string;
  tags?: string[];
}

export interface CoachMarkTarget {
  key: string;
  title: string;
  description: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

export enum HelpEvent {
  OPEN_HELP = 'open_help',
  OPEN_STATUS_LEGEND = 'open_status_legend', 
  OPEN_QUICKSTART = 'open_quickstart',
  ARTICLE_READ = 'article_read',
  COACHMARK_SHOWN = 'coachmark_shown'
}

export interface StatusBadge {
  key: string;
  label: string;
  description: string;
  color: string;
  icon: string;
}

export interface BridgeSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  dataUsed: number;
  batteryUsed: number;
}