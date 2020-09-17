import React, { useState } from 'react';
import {Modal,Button, Form, Input, TextArea} from 'semantic-ui-react';


function CreateContent() {
    const [open, setOpen] = useState(false)
    const [loading, setLoader] = useState(false)
    function onSubmit() {
        setLoader(true)
        setTimeout(() => {
            setLoader(false)
        }, 3000);
        setTimeout(() => {
            setOpen(false)
        }, 3500);
    }
    return (
        <React.Fragment>
            <Modal
                closeOnDimmerClick={false}
                onClose={() => setOpen(false)}
                onOpen={() => setOpen(true)}
                open={open}
                size={"large"}
                trigger={<Button basic>Create Content</Button>}
                >
                <Modal.Header>Create Content</Modal.Header>
                <Modal.Content>
                    <Modal.Description>
                    <Form loading={loading}>
                        <Form.Field required>
                            <label>Title</label>
                            <Input placeholder='Enter a title name' />
                        </Form.Field>
                        <Form.Field>
                            <label>Description</label>
                            <TextArea placeholder='Tell something about this lesson' style={{ minHeight: 100 }} />
                        </Form.Field>
                    </Form>
                    </Modal.Description>
                </Modal.Content>
                <Modal.Actions>
                    <Button negative onClick={()=>setOpen(false)}>Cancel</Button>
                    <Button positive onClick={onSubmit}>Submit</Button>
                </Modal.Actions>
            </Modal>
        </React.Fragment>
    )
}
export default CreateContent