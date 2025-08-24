import { useState, useEffect } from 'react';
import type { CoachMarkTarget } from '@/types/help';

const COACH_MARK_TARGETS: CoachMarkTarget[] = [
  {
    key: 'verify-button',
    title: 'Verify Devices',
    description: 'Scan to verify devices to ensure secure communication and prevent spoofing.',
    placement: 'bottom'
  },
  {
    key: 'start-call-button', 
    title: 'Start Private Call',
    description: 'Start a private video call over the local mesh network.',
    placement: 'bottom'
  },
  {
    key: 'global-mode-button',
    title: 'Go Global',
    description: 'Connect with users worldwide via encrypted bridge tunnels.',
    placement: 'bottom'
  },
  {
    key: 'share-button',
    title: 'Share Content',
    description: 'Send media files with signed Safety Manifests for secure sharing.',
    placement: 'bottom'
  }
];

const STORAGE_KEY = 'meshtv-coachmarks-shown';

interface CoachMarkState {
  [key: string]: boolean;
}

export function useCoachMarks() {
  const [shownMarks, setShownMarks] = useState<CoachMarkState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [currentTarget, setCurrentTarget] = useState<CoachMarkTarget | null>(null);
  const [queuedTargets, setQueuedTargets] = useState<CoachMarkTarget[]>([]);

  useEffect(() => {
    // Save to localStorage when shownMarks changes
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shownMarks));
  }, [shownMarks]);

  const shouldShow = (key: string): boolean => {
    return !shownMarks[key];
  };

  const markShown = (key: string) => {
    setShownMarks(prev => ({ ...prev, [key]: true }));
  };

  const showCoachMark = (key: string) => {
    if (!shouldShow(key)) return;
    
    const target = COACH_MARK_TARGETS.find(t => t.key === key);
    if (!target) return;

    // If another coach mark is currently showing, queue this one
    if (currentTarget) {
      setQueuedTargets(prev => [...prev, target]);
      return;
    }

    setCurrentTarget(target);
  };

  const dismissCoachMark = () => {
    if (currentTarget) {
      markShown(currentTarget.key);
      setCurrentTarget(null);
      
      // Show next queued coach mark
      if (queuedTargets.length > 0) {
        const nextTarget = queuedTargets[0];
        setQueuedTargets(prev => prev.slice(1));
        setCurrentTarget(nextTarget);
      }
    }
  };

  const resetAllCoachMarks = () => {
    setShownMarks({});
    setCurrentTarget(null);
    setQueuedTargets([]);
  };

  const triggerCoachMarkSequence = () => {
    // Show coach marks for elements that are currently visible
    const visibleTargets = COACH_MARK_TARGETS.filter(target => {
      const element = document.querySelector(`[data-coach-mark="${target.key}"]`);
      return element && shouldShow(target.key);
    });

    if (visibleTargets.length > 0) {
      setCurrentTarget(visibleTargets[0]);
      setQueuedTargets(visibleTargets.slice(1));
    }
  };

  return {
    currentTarget,
    targets: COACH_MARK_TARGETS,
    shouldShow,
    markShown,
    showCoachMark,
    dismissCoachMark,
    resetAllCoachMarks,
    triggerCoachMarkSequence,
    shownMarks
  };
}