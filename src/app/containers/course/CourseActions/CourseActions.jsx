import React from 'react';
import { Button, Modal, Title, Text, Group, Stack } from '@mantine/core';
import { IconCheck, IconArchive, IconTrash, IconX, IconAlertCircle } from '@tabler/icons-react';

export const PublishModal = ({ open, onConfirm, onCancel, courseTitle, loading = false }) => (
  <Modal opened={open} onClose={loading ? undefined : onCancel} title="Publish Course" centered closeOnClickOutside={!loading} closeOnEscape={!loading} className="ui modal">
    <Stack gap="md">
      <Text size="sm">
        Are you sure you want to publish <strong>{courseTitle}</strong>?
        Once published, it will be visible to all users.
      </Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button color="green" onClick={onConfirm} loading={loading} leftSection={<IconCheck size={16} />}>Publish</Button>
      </Group>
    </Stack>
  </Modal>
);

export const ArchiveModal = ({ open, onConfirm, onCancel, courseTitle, loading = false }) => (
  <Modal opened={open} onClose={loading ? undefined : onCancel} title="Archive Course" centered closeOnClickOutside={!loading} closeOnEscape={!loading} className="ui modal">
    <Stack gap="md">
      <Text size="sm">
        Are you sure you want to archive <strong>{courseTitle}</strong>?
        Archived courses are hidden from users but can be restored later.
      </Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button color="orange" onClick={onConfirm} loading={loading} leftSection={<IconArchive size={16} />}>Archive</Button>
      </Group>
    </Stack>
  </Modal>
);

export const DeleteModal = ({ open, onConfirm, onCancel, itemName, itemType = 'course', loading = false }) => (
  <Modal opened={open} onClose={loading ? undefined : onCancel} title={`Delete ${itemType === 'lesson' ? 'Lesson' : 'Course'}`} centered closeOnClickOutside={!loading} closeOnEscape={!loading} className="ui modal">
    <Stack gap="md">
      <Text size="sm">
        Are you sure you want to delete <strong>{itemName}</strong>?
        This action cannot be undone.
      </Text>
      <Group justify="flex-end">
        <Button variant="default" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button color="red" onClick={onConfirm} loading={loading} leftSection={<IconTrash size={16} />}>Delete</Button>
      </Group>
    </Stack>
  </Modal>
);

export default { PublishModal, ArchiveModal, DeleteModal };
