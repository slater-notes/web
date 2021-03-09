import React, { useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import { globalDecorators } from '../decorators';
import DefaultDialog from '../../components/Dialogs/DefaultDialog';
import FullDialog from '../../components/Dialogs/FullDialog';

export default {
  title: 'Components/Dialogs',
  component: DefaultDialog,
  decorators: globalDecorators,
} as Meta;

const TemplateAlert: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Click to open dialog
      </button>

      {isOpen && (
        <DefaultDialog
          title='Delete File?'
          text='Are you sure you want to delete this file?'
          withCancel
          withConfirm
          confirmLabel='Delete File'
          onCancel={() => setIsOpen(false)}
          onConfirm={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
export const AlertExample = TemplateAlert.bind({});

const TemplateFullDialog: Story = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Click to open dialog
      </button>

      {isOpen && (
        <FullDialog title='Settings' onClose={() => setIsOpen(false)}>
          <div>This is a full dialog example.</div>
        </FullDialog>
      )}
    </div>
  );
};
export const FullDialogExample = TemplateFullDialog.bind({});
