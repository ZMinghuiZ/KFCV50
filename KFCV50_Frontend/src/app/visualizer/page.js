'use client';

import dynamic from 'next/dynamic';

// Using the @ alias instead of relative path
const Visualizer = dynamic(
  () => import('@/app/components/Visualizer'),
  { ssr: false }
);

export default function VisualizerPage() {
  return (
    <div>
      <Visualizer />
    </div>
  );
}