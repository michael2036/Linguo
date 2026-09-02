import type { ReactNode } from 'react';
import { Button, Text, makeStyles, tokens, shorthands } from '@fluentui/react-components';
import { ArrowLeft24Regular } from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';

export interface LegalSection {
  heading: string;
  body: ReactNode;
}

interface LegalDocumentProps {
  title: string;
  updated: string;
  sections: LegalSection[];
}

const useStyles = makeStyles({
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('20px'),
    maxWidth: '640px',
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
  },
  updated: {
    color: tokens.colorNeutralForeground3,
    fontSize: '13px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    ...shorthands.gap('6px'),
  },
  heading: {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
  },
  body: {
    color: tokens.colorNeutralForeground2,
    lineHeight: '1.6',
  },
});

export const LegalDocument = ({ title, updated, sections }: LegalDocumentProps) => {
  const styles = useStyles();
  const navigate = useNavigate();

  return (
    <div className={styles.wrap}>
      <Button className={styles.backButton} appearance="subtle" icon={<ArrowLeft24Regular />} onClick={() => navigate(-1)}>
        Zurück
      </Button>
      <div>
        <Text as="h1" size={700} className={styles.title}>
          {title}
        </Text>
        <div>
          <Text className={styles.updated}>Stand: {updated}</Text>
        </div>
      </div>
      {sections.map((section) => (
        <div key={section.heading} className={styles.section}>
          <Text as="h2" size={500} className={styles.heading}>
            {section.heading}
          </Text>
          <Text as="p" className={styles.body}>
            {section.body}
          </Text>
        </div>
      ))}
    </div>
  );
};
