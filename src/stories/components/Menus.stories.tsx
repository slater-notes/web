import React, { useRef, useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import { globalDecorators } from '../decorators';
import SimpleTextMenu from '../../components/Menus/SimpleTextMenu';

export default {
  title: 'Components/Menus',
  component: SimpleTextMenu,
  decorators: globalDecorators,
} as Meta;

const TemplateExample: Story = () => {
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        ref={ref}
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Click to open menu
      </button>

      <SimpleTextMenu
        anchorEl={ref.current}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        items={[
          {
            label: 'Option 1',
            onClick: () => {},
          },
          {
            label: 'Option 2',
            onClick: () => {},
          },
          {
            label: 'Option 3',
            onClick: () => {},
          },
        ]}
      />
    </div>
  );
};
export const Example = TemplateExample.bind({});
