import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import { globalDecorators } from '../decorators';
import DefaultButton from '../../components/Buttons/DefaultButton';

export default {
  title: 'Components/Buttons',
  decorators: globalDecorators,
} as Meta;

const TemplateDefault: Story = () => {
  return <DefaultButton text='Example Button' buttonProps={{variant: 'contained', color: 'primary'}} />;
};
export const Normal = TemplateDefault.bind({});

