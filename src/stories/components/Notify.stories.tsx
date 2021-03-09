import React, { useRef, useState } from 'react';
import { Story, Meta } from '@storybook/react/types-6-0';
import { globalDecorators } from '../decorators';
import DefaultNotify from '../../components/Notify/DefaultNotify';

export default {
  title: 'Components/Notify',
  component: DefaultNotify,
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
        Trigger notify
      </button>

      <DefaultNotify
        message='This is a test.'
        isOpen={isOpen}
        handleClose={() => setIsOpen(false)}
      />
    </div>
  );
};
export const Example = TemplateExample.bind({});
