import React from 'react';
import styles from './toolbar.module.css';
import Button from './Button';
import { ReactComponent as PlayCircleOutline } from '../../assets/icons/PlayCircleOutline.svg';
import { ReactComponent as PauseCircleOutline } from '../../assets/icons/PauseCircleOutline.svg';

export default function Toolbar({ allActions, isPlaying }) {
  return (
    <div className={styles.toolbar}>
      <Button onClick={allActions.togglePlaying}>
        {isPlaying ? (
          <PauseCircleOutline className={styles.buttonIcon} />
        ) : (
          <PlayCircleOutline className={styles.buttonIcon} />
        )}
      </Button>
    </div>
  );
}
