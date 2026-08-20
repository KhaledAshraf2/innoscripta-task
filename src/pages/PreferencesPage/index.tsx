import { PreferencesPanel } from '@/features/preferences/components/PreferencesPanel';
import styles from './PreferencesPage.module.css';

export function PreferencesPage() {
  return (
    <div className={styles.scroller}>
      <div className={styles.inner}>
        <PreferencesPanel />
      </div>
    </div>
  );
}
