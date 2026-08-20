import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useId } from 'react';
import { Button } from '@/components/button';
import { Checkbox } from '@/components/checkbox';
import { Label } from '@/components/label';
import { Separator } from '@/components/separator';
import { SourceMultiSelect } from '@/features/articles/components/SourceMultiSelect';
import {
  ARTICLE_CATEGORIES,
  ARTICLE_CATEGORY_LABELS,
} from '@/features/articles/types';
import { TokenListEditor } from '@/features/preferences/components/TokenListEditor';
import { usePreferences } from '@/features/preferences/PreferencesContext';
import styles from './PreferencesPanel.module.css';

export function PreferencesPanel() {
  const {
    preferences,
    hasAny,
    toggleCategory,
    setSources,
    addAuthor,
    removeAuthor,
    reset,
  } = usePreferences();
  const sourcesId = useId();

  return (
    <section className={styles.section} aria-labelledby="preferences-heading">
      <div className={styles.headingRow}>
        <div>
          <h1 id="preferences-heading" className={styles.heading}>
            Your preferences
          </h1>
          <p className={styles.lede}>
            Saved in this browser only. They shape the <strong>For you</strong>{' '}
            feed.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={reset}
          disabled={!hasAny}>
          <RestartAltIcon fontSize="small" />
          Reset to defaults
        </Button>
      </div>

      <Separator />

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Categories</legend>
        <p className={styles.lede}>
          Pick the categories you want to see in the For you feed.
        </p>
        <div className={styles.categories}>
          {ARTICLE_CATEGORIES.map((category) => (
            <div key={category} className={styles.checkRow}>
              <Checkbox
                id={`preference-${category}`}
                checked={preferences.categories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
              />
              <Label
                htmlFor={`preference-${category}`}
                className={styles.categoryLabel}>
                {ARTICLE_CATEGORY_LABELS[category]}
              </Label>
            </div>
          ))}
        </div>
      </fieldset>

      <Separator />

      <div className={styles.fieldset}>
        <Label htmlFor={sourcesId}>Sources</Label>
        <p className={styles.lede}>
          Select one or more. Same list as the feed filters.
        </p>
        <SourceMultiSelect
          id={sourcesId}
          value={preferences.sources}
          onValueChange={setSources}
        />
      </div>

      <Separator />

      <TokenListEditor
        label="Authors"
        description="Matched against article bylines."
        placeholder="e.g. Jane Doe"
        values={preferences.authors}
        onAdd={addAuthor}
        onRemove={removeAuthor}
      />
    </section>
  );
}
