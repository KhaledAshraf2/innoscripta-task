import CloseIcon from '@mui/icons-material/Close';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import {
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  cloneElement,
  useState,
} from 'react';
import { cx } from '@/lib/cx';
import styles from './sheet.module.css';

type ClickableChild = ReactElement<{
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}>;

function mergeClick(child: ClickableChild, onActivate: () => void) {
  return cloneElement(child, {
    onClick: (event: MouseEvent<HTMLElement>) => {
      child.props.onClick?.(event);
      onActivate();
    },
  });
}

type SheetProps = {
  trigger: ClickableChild;
  title: string;
  titleClassName?: string;
  description?: string;
  children?: ReactNode;
};

export function Sheet({
  trigger,
  title,
  titleClassName,
  description,
  children,
}: SheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {mergeClick(trigger, () => setOpen(true))}
      <Drawer
        anchor="left"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{ paper: { className: styles.paper } }}
      >
        <IconButton
          aria-label="Close"
          className={styles.close}
          onClick={() => setOpen(false)}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        <div className={styles.header}>
          <Typography
            variant="subtitle1"
            component="h2"
            className={cx(styles.title, titleClassName)}
          >
            {title}
          </Typography>
          {description ? (
            <Typography
              variant="body2"
              color="textSecondary"
              component="p"
              className={styles.description}
            >
              {description}
            </Typography>
          ) : null}
        </div>
        {children}
      </Drawer>
    </>
  );
}
