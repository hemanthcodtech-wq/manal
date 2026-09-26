import React from 'react';
import './Skeleton.css';

export default function Skeleton({ type, count = 1, style = {} }) {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div key={i} className={`skeleton skeleton-${type}`} style={style}></div>
  ));

  return <>{skeletons}</>;
}
