import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import { globalDecorators } from '../decorators';
import FilesList from '../../components/FilesList';

export default {
  title: 'Components/FilesList',
  component: FilesList,
  decorators: globalDecorators,
} as Meta;

const TemplateExample: Story = () => (
  <FilesList
    explorerProps={{
      title: 'All Notes',
      withDividers: true,
      items: [
        { text: 'Todo ✍', sub: 'Updated 2 hours ago' },
        { text: 'My Finances 2021 🤑', sub: 'Updated 5 days ago' },
        { text: 'Some other note 📑', sub: 'Updated a week ago' },
      ],
    }}
    withFilter
  />
);
export const Example = TemplateExample.bind({});
