import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import { globalDecorators } from '../decorators';
import Tag from '../../components/Tag';

export default {
  title: 'Components/Tags',
  decorators: globalDecorators,
} as Meta;

const TemplateDefault: Story = () => {
  return <Tag text='Example' />;
};
export const Normal = TemplateDefault.bind({});

