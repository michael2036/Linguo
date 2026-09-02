import { Badge } from '@fluentui/react-components';
import type { ChapterStatus } from '../../types/appState';

const LABELS: Record<ChapterStatus, string> = {
  red: 'Übungsbedarf',
  yellow: 'In Bearbeitung',
  green: 'Gemeistert',
};

const COLORS: Record<ChapterStatus, 'danger' | 'warning' | 'success'> = {
  red: 'danger',
  yellow: 'warning',
  green: 'success',
};

export const TrafficLightBadge = ({ status }: { status: ChapterStatus }) => (
  <Badge color={COLORS[status]} appearance="filled" size="medium">
    {LABELS[status]}
  </Badge>
);
