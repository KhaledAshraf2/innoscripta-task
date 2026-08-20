import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useId, useState } from 'react';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Label } from '@/components/label';
import styles from './TokenListEditor.module.css';

type TokenListEditorProps = {
  label: string;
  description: string;
  placeholder: string;
  values: readonly string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
};

/** Free-text list editor for values that cannot be enumerated upfront. */
export function TokenListEditor({
  label,
  description,
  placeholder,
  values,
  onAdd,
  onRemove,
}: TokenListEditorProps) {
  const inputId = useId();
  const [draft, setDraft] = useState('');

  const submit = () => {
    if (draft.trim() === '') return;
    onAdd(draft);
    setDraft('');
  };

  return (
    <div className={styles.root}>
      <Label htmlFor={inputId}>{label}</Label>
      <p className={styles.description}>{description}</p>
      <div className={styles.row}>
        <Input
          id={inputId}
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            submit();
          }}
        />
        <Button type="button" variant="secondary" onClick={submit} disabled={draft.trim() === ''}>
          <AddIcon fontSize="small" />
          Add
        </Button>
      </div>
      {values.length > 0 && (
        <ul aria-label={`Selected ${label.toLowerCase()}`} className={styles.tokens}>
          {values.map((value) => (
            <li key={value}>
              <Button type="button" variant="secondary" size="sm" onClick={() => onRemove(value)}>
                <span className={styles.token}>{value}</span>
                <CloseIcon sx={{ fontSize: 12 }} aria-hidden="true" />
                <span className="visuallyHidden">Remove {value}</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
