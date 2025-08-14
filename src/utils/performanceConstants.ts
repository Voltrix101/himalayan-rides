// Performance monitoring constants and utilities

export const PERFORMANCE_THRESHOLDS = {
  FCP: 1800,
  LCP: 2500,
  FID: 100,
  CLS: 0.1,
  TTFB: 600,
} as const;

export const METRIC_NAMES = {
  FCP: 'First Contentful Paint',
  LCP: 'Largest Contentful Paint',
  FID: 'First Input Delay',
  CLS: 'Cumulative Layout Shift',
  TTFB: 'Time to First Byte',
} as const;

export const getPerformanceGrade = (value: number, threshold: number): 'good' | 'needs-improvement' | 'poor' => {
  if (value <= threshold) return 'good';
  if (value <= threshold * 1.5) return 'needs-improvement';
  return 'poor';
};

export const formatMetricValue = (name: string, value: number): string => {
  if (name === 'CLS') {
    return value.toFixed(3);
  }
  return `${Math.round(value)}ms`;
};
