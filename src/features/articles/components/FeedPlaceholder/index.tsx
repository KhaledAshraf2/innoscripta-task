import InboxIcon from '@mui/icons-material/Inbox';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import type { ReactNode } from 'react';
import { Button } from '@/components/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/card';
import styles from './FeedPlaceholder.module.css';

type FeedPlaceholderProps = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => unknown };
  children?: ReactNode;
};

function FeedPlaceholder({ icon, title, description, action, children }: FeedPlaceholderProps) {
  return (
    <Card>
      <CardContent className={styles.content}>
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
        <CardTitle component="h2">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {action && (
          <Button type="button" variant="outline" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

export function FeedEmptyState({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <FeedPlaceholder
      icon={<InboxIcon className={styles.glyph} />}
      title="No articles match your filters"
      description="Try a different keyword, widen the date range, or clear the filters to see the full feed."
      action={{ label: 'Clear all filters', onClick: onClearFilters }}
    />
  );
}

export function FeedErrorState({ message, onRetry }: { message: string; onRetry: () => unknown }) {
  return (
    <FeedPlaceholder
      icon={<WifiOffIcon className={styles.glyph} />}
      title="We could not load the news"
      description={message}
      action={{ label: 'Retry', onClick: onRetry }}
    />
  );
}

export function NoProvidersState() {
  return (
    <FeedPlaceholder
      icon={<PowerOffIcon className={styles.glyph} />}
      title="No news provider is configured"
      description="Add at least one API key to your .env file and restart the dev server. Providers without a key are skipped automatically."
    />
  );
}
