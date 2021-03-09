import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import { globalDecorators } from '../decorators';
import Editor from '../../components/Editor';

export default {
  title: 'Components/Editor',
  component: Editor,
  decorators: globalDecorators,
} as Meta;

const TemplateEditor: Story = () => {
  return <Editor id='editor' handleSave={() => {}} />;
};
export const Example = TemplateEditor.bind({});
