import React from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import { globalDecorators } from '../decorators';
import { FolderPlus, MoreHorizontal } from 'react-feather';
import IconButtonWithMenu from '../../components/Buttons/IconButtonWithMenu';
import DefaultIconButton from '../../components/Buttons/DefaultIconButton';

export default {
  title: 'Components/IconButtons',
  decorators: globalDecorators,
} as Meta;

const TemplateDefault: Story = () => {
  return <DefaultIconButton icon={FolderPlus} onClick={() => {}} />;
};
export const Normal = TemplateDefault.bind({});

const TemplateWithMenu: Story = () => {
  return (
    <IconButtonWithMenu
      icon={MoreHorizontal}
      menuItems={[
        {
          label: 'Rename',
          onClick: () => {},
        },
        {
          label: 'Move to Trash',
          onClick: () => {},
        },
      ]}
    />
  );
};
export const ButtonWithMenu = TemplateWithMenu.bind({});
