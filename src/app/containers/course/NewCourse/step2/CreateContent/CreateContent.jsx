import React, { useState } from 'react';
import { Modal, TextInput, Textarea, Button, Stack, Group } from '@mantine/core';
import { IconX, IconCheck } from '@tabler/icons-react';

function CreateContent() {
  const [open, setOpen] = useState(false);
  const [loading, setLoader] = useState(false);
  function onSubmit() { setLoader(true); setTimeout(() => setLoader(false), 3000); setTimeout(() => setOpen(false), 3500); }
  return (
    <>
      <Button variant="subtle" onClick={() => setOpen(true)}>Create Content</Button>
      <Modal opened={open} onClose={() => setOpen(false)} title="Create Content" size="lg" closeOnClickOutside={false}>
        <Stack>
          <TextInput label="Title" placeholder="Enter a title name" required />
          <Textarea label="Description" placeholder="Tell something about this content" minRows={4} />
        </Stack>
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={() => setOpen(false)} leftSection={<IconX size={14} />}>Cancel</Button>
          <Button onClick={onSubmit} loading={loading} leftSection={<IconCheck size={14} />}>Submit</Button>
        </Group>
      </Modal>
    </>
  );
}
export default CreateContent;
