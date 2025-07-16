import { ReactElement } from 'react';

export type SidebarItemProps = {
  icon?: ReactElement;
  iconSrc?: string;
  label: string;
  to: string;
};
