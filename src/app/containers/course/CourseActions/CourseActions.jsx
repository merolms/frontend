import React from 'react';
import { Modal, Button, Header, Icon } from 'semantic-ui-react';

export const PublishModal = ({ open, onConfirm, onCancel, courseTitle, loading = false }) => (
  <Modal open={open} onClose={onCancel} size='small' closeOnDimmerClick={!loading}>
    <Header icon='check circle outline' content='Publish Course' />
    <Modal.Content>
      <p>
        Are you sure you want to publish <strong>{courseTitle}</strong>?
        Once published, it will be visible to all users.
      </p>
    </Modal.Content>
    <Modal.Actions>
      <Button onClick={onCancel} disabled={loading}>
        Cancel
      </Button>
      <Button color='green' onClick={onConfirm} loading={loading}>
        <Icon name='check' /> Publish
      </Button>
    </Modal.Actions>
  </Modal>
);

export const ArchiveModal = ({ open, onConfirm, onCancel, courseTitle, loading = false }) => (
  <Modal open={open} onClose={onCancel} size='small' closeOnDimmerClick={!loading}>
    <Header icon='archive' content='Archive Course' color='orange' />
    <Modal.Content>
      <p>
        Are you sure you want to archive <strong>{courseTitle}</strong>?
        Archived courses are hidden from users but can be restored later.
      </p>
    </Modal.Content>
    <Modal.Actions>
      <Button onClick={onCancel} disabled={loading}>
        Cancel
      </Button>
      <Button color='orange' onClick={onConfirm} loading={loading}>
        <Icon name='archive' /> Archive
      </Button>
    </Modal.Actions>
  </Modal>
);

export const DeleteModal = ({ open, onConfirm, onCancel, itemName, itemType = 'course', loading = false }) => (
  <Modal open={open} onClose={onCancel} size='small' closeOnDimmerClick={!loading}>
    <Header icon='trash' content={`Delete ${itemType === 'lesson' ? 'Lesson' : 'Course'}`} color='red' />
    <Modal.Content>
      <p>
        Are you sure you want to delete <strong>{itemName}</strong>?
        This action cannot be undone.
      </p>
    </Modal.Content>
    <Modal.Actions>
      <Button onClick={onCancel} disabled={loading}>
        Cancel
      </Button>
      <Button color='red' onClick={onConfirm} loading={loading}>
        <Icon name='trash' /> Delete
      </Button>
    </Modal.Actions>
  </Modal>
);

export default { PublishModal, ArchiveModal, DeleteModal };
