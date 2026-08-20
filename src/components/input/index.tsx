import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import type { ComponentProps, ReactNode } from 'react';

type InputProps = {
  id?: string;
  className?: string | undefined;
  type?: ComponentProps<'input'>['type'];
  value?: string;
  placeholder?: string;
  min?: string;
  max?: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  onChange?: ComponentProps<'input'>['onChange'];
  onKeyDown?: ComponentProps<'input'>['onKeyDown'];
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
  'aria-label'?: string;
};

export function Input({
  className,
  type = 'text',
  startAdornment,
  endAdornment,
  id,
  value,
  onChange,
  onKeyDown,
  placeholder,
  min,
  max,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  'aria-label': ariaLabel,
}: InputProps) {
  return (
    <TextField
      type={type}
      size="small"
      fullWidth
      error={ariaInvalid === true}
      {...(className !== undefined ? { className } : {})}
      {...(id !== undefined ? { id } : {})}
      {...(value !== undefined ? { value } : {})}
      {...(onChange !== undefined ? { onChange } : {})}
      {...(placeholder !== undefined ? { placeholder } : {})}
      slotProps={{
        input: {
          ...(startAdornment !== undefined
            ? {
                startAdornment: (
                  <InputAdornment position="start">{startAdornment}</InputAdornment>
                ),
              }
            : {}),
          ...(endAdornment !== undefined
            ? {
                endAdornment: <InputAdornment position="end">{endAdornment}</InputAdornment>,
              }
            : {}),
        },
        htmlInput: {
          ...(min !== undefined ? { min } : {}),
          ...(max !== undefined ? { max } : {}),
          ...(onKeyDown !== undefined ? { onKeyDown } : {}),
          ...(ariaInvalid !== undefined ? { 'aria-invalid': ariaInvalid } : {}),
          ...(ariaDescribedBy !== undefined ? { 'aria-describedby': ariaDescribedBy } : {}),
          ...(ariaLabel !== undefined ? { 'aria-label': ariaLabel } : {}),
        },
      }}
    />
  );
}
