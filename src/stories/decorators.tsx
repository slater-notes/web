import React from 'react';
import { ThemeDecorator } from '../themes';

export const globalDecorators = [
  (Story: any) => (
    <ThemeDecorator>
      <Story />
    </ThemeDecorator>
  ),
];
