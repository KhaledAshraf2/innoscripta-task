import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import MuiSelect from '@mui/material/Select';
import styles from './select.module.css';

type MultiSelectOption = {
  value: string;
  label: string;
};

type MultiSelectProps = {
  id?: string;
  'aria-label'?: string;
  value: readonly string[];
  options: readonly MultiSelectOption[];
  placeholder?: string;
  onValueChange: (value: readonly string[]) => void;
};

export function MultiSelect({
  id,
  'aria-label': ariaLabel,
  value,
  options,
  placeholder = 'Select…',
  onValueChange,
}: MultiSelectProps) {
  const labels = new Map(options.map((option) => [option.value, option.label]));
  const summary =
    value.length === 0
      ? placeholder
      : value.map((item) => labels.get(item) ?? item).join(', ');

  return (
    <MuiSelect
      multiple
      displayEmpty
      value={[...value]}
      size="small"
      fullWidth
      className={styles.root}
      sx={{
        '& .MuiSelect-select': {
          display: 'block',
          overflow: 'hidden',
          minWidth: 0,
        },
      }}
      renderValue={() => (
        <span className={value.length === 0 ? styles.placeholder : styles.value}>{summary}</span>
      )}
      onChange={(event) => {
        const next = event.target.value;
        onValueChange(Array.isArray(next) ? next : []);
      }}
      {...(ariaLabel !== undefined ? { 'aria-label': ariaLabel } : {})}
      {...(id !== undefined ? { inputProps: { id } } : {})}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          <Checkbox checked={value.includes(option.value)} size="small" sx={{ pointerEvents: 'none' }} />
          <ListItemText primary={option.label} />
        </MenuItem>
      ))}
    </MuiSelect>
  );
}
