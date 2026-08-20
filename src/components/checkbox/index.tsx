import MuiCheckbox from '@mui/material/Checkbox';

type CheckboxProps = {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export function Checkbox({ id, checked, onCheckedChange }: CheckboxProps) {
  return (
    <MuiCheckbox
      size="small"
      checked={checked === true}
      onChange={(_event, next) => onCheckedChange?.(next)}
      {...(id !== undefined ? { id } : {})}
    />
  );
}
