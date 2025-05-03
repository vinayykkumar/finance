import React, { useState, useEffect } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import 'tippy.js/themes/light.css';

interface ContextualTooltipProps {
  children: React.ReactNode;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  showOnlyForNewUsers?: boolean;
  delay?: number;
  duration?: number;
  id?: string;
}

const ContextualTooltip: React.FC<ContextualTooltipProps> = ({
  children,
  content,
  placement = 'top',
  showOnlyForNewUsers = true,
  delay = 500,
  duration = 5000,
  id
}) => {
  const [visible, setVisible] = useState(false);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);

  useEffect(() => {
    // Check if this specific tooltip has been seen before
    if (id) {
      const seenTooltips = JSON.parse(localStorage.getItem('seenTooltips') || '{}');
      if (seenTooltips[id]) {
        setHasBeenSeen(true);
        return;
      }
    }

    // Check if user is new
    if (showOnlyForNewUsers) {
      const isNewUser = !localStorage.getItem('financeAppVisited');
      if (!isNewUser) {
        return;
      }
    }

    // Show tooltip after delay
    const showTimer = setTimeout(() => {
      setVisible(true);
    }, delay);

    // Hide tooltip after duration
    const hideTimer = setTimeout(() => {
      setVisible(false);
      
      // Mark this tooltip as seen
      if (id) {
        const seenTooltips = JSON.parse(localStorage.getItem('seenTooltips') || '{}');
        seenTooltips[id] = true;
        localStorage.setItem('seenTooltips', JSON.stringify(seenTooltips));
        setHasBeenSeen(true);
      }
    }, delay + duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [delay, duration, id, showOnlyForNewUsers]);

  // Don't render Tippy if tooltip has been seen or should not be shown
  if (hasBeenSeen && showOnlyForNewUsers) {
    return <>{children}</>;
  }

  return (
    <Tippy
      content={content}
      visible={visible}
      placement={placement}
      animation="scale"
      theme="light"
      arrow={true}
      duration={300}
      onClickOutside={() => setVisible(false)}
    >
      {children}
    </Tippy>
  );
};

export default ContextualTooltip;
