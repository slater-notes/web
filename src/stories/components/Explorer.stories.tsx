import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import Explorer from '../../components/Explorer';
import { globalDecorators } from '../decorators';
import { Book, Star, Trash } from 'react-feather';

export default {
  title: 'Components/Explorer',
  component: Explorer,
  decorators: globalDecorators,
} as Meta;

const TemplateExample: Story = () => (
  <Explorer items={[{ text: 'Item One' }, { text: 'Item Two' }, { text: 'Item Three' }]} />
);
export const Example = TemplateExample.bind({});

const TemplateTitle: Story = () => (
  <Explorer
    title='Folders'
    items={[{ text: 'Random Notes' }, { text: 'Work Stuff' }, { text: 'School 📖' }]}
  />
);
export const WithTitle = TemplateTitle.bind({});

const TemplateIcon: Story = () => (
  <Explorer
    items={[
      { icon: Book, text: 'All Notes' },
      { icon: Star, text: 'Favorites' },
      { icon: Trash, text: 'Trash' },
    ]}
  />
);
export const WithIcons = TemplateIcon.bind({});
