import React from 'react';
import { theme } from '../../theme';

export const HowItWorks = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Coming Soon</h1>
    </div>
  );
};

export const Features = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Coming Soon</h1>
    </div>
  );
};

export const Pricing = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Coming Soon</h1>
    </div>
  );
};

export const About = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Coming Soon</h1>
    </div>
  );
};

export const Contact = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Coming Soon</h1>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.section,
  },
  heading: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight,
    color: theme.colors.text,
  },
};