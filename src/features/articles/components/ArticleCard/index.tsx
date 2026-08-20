import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Badge } from '@/components/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/card';
import { ArticleImage } from '@/features/articles/components/ArticleImage';
import {
  formatPublishedAt,
  toDateTimeAttribute,
} from '@/features/articles/helpers/formatDate';
import { PROVIDER_LABELS, type Article } from '@/features/articles/types';
import styles from './ArticleCard.module.css';

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Card component="article" className={styles.card}>
      <div className={styles.media}>
        <ArticleImage src={article.imageUrl} alt="" />
      </div>

      <CardContent className={styles.content}>
        <CardDescription className={styles.meta}>
          <span className={styles.source}>{article.source}</span>
          <span aria-hidden="true">&middot;</span>
          <time dateTime={toDateTimeAttribute(article.publishedAt)}>
            {formatPublishedAt(article.publishedAt)}
          </time>
          {article.author !== null && (
            <>
              <span aria-hidden="true">&middot;</span>
              <span className={styles.author}>{article.author}</span>
            </>
          )}
        </CardDescription>

        <CardTitle component="h3" className={styles.title}>
          <a
            href={article.url}
            target="_blank"
            rel="noreferrer noopener"
            className={styles.titleLink}
          >
            {article.title}
          </a>
        </CardTitle>

        {article.description !== null && (
          <CardDescription className={styles.excerpt}>
            {article.description}
          </CardDescription>
        )}

        <div className={styles.footer}>
          <Badge variant="secondary">
            {PROVIDER_LABELS[article.provider]}
          </Badge>
          {article.category !== null && (
            <Badge variant="outline" className={styles.category}>
              {article.category}
            </Badge>
          )}
          <CardDescription className={styles.readLink}>
            <span className={styles.readAnchor}>
              Read article
              <OpenInNewIcon sx={{ fontSize: 12 }} aria-hidden="true" />
            </span>
          </CardDescription>
        </div>
      </CardContent>
    </Card>
  );
}
