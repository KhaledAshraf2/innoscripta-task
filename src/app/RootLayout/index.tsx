import { Outlet } from 'react-router';
import { Header } from '@/app/Header';
import styles from './RootLayout.module.css';

/**
 * The shell owns the viewport height so the feed can scroll inside its own
 * container while the header stays put.
 */
export function RootLayout() {
  return (
    <div className={styles.shell}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
