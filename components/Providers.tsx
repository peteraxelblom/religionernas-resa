'use client';

import AchievementToast from './AchievementToast';

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <>
      {children}
      <AchievementToast />
    </>
  );
}
