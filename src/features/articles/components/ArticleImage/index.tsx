import NewspaperIcon from '@mui/icons-material/Newspaper';
import { useState } from 'react';
import styles from './ArticleImage.module.css';

type ArticleImageProps = {
  src: string | null;
  alt: string;
};

/** Fixed aspect ratio keeps cards from jumping while images load. */
export function ArticleImage({ src, alt }: ArticleImageProps) {
  const [hasFailed, setHasFailed] = useState(false);

  if (src === null || hasFailed) {
    return (
      <div aria-hidden="true" className={styles.fallback}>
        <NewspaperIcon className={styles.icon} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setHasFailed(true)}
      className={styles.image}
    />
  );
}
