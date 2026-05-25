import React, {useState} from 'react';
import {Modal,Button} from 'semantic-ui-react';
import Step1 from '@/app/containers/course/NewCourse/step1/step1'
import Step2 from '@/app/containers/course/NewCourse/step2/step2'

function NewCourse(){
    const [open, setOpen] = useState(false)
    const [loading, setLoader] = useState()
    const [step, setStep] = useState(1)
    function onNext(){    
        setLoader(true)
        setTimeout(() => {
            setLoader(false)
        }, 3000);
        setTimeout(() => {
            setStep(step+1)
        }, 3500);
    }
    function onPrevious() {
        setStep(step-1)
    }
    function onCancel(){
        setStep(1)
        setOpen(false)
    }
    let display
    let title
    switch(step) {
        case 1:
            title="Create Course"
            display=<Step1 loading={loading} />
        break
        case 2:
            title="Course Builder"
            display=<Step2 loading={loading} />
            break
        case 3:
            break
        case 4:
            break
    }
    return (
        <div>
            <Modal
                closeOnDimmerClick={false}
                onClose={() => setOpen(false)}
                onOpen={() => setOpen(true)}
                open={open}
                size={"large"}
                trigger={<Button positive>Create Course</Button>}
                >
                <Modal.Header>{title}</Modal.Header>
                <Modal.Content image>
                    <Modal.Description>
                        {display}
                    </Modal.Description>
                </Modal.Content>
                <Modal.Actions>
                    <Button negative onClick={onCancel}>Previous</Button>
                    <Button negative onClick={onCancel}>Cancel</Button>
                    <Button positive onClick={onNext}>Next</Button>
                </Modal.Actions>
            </Modal>
        </div>
    )
}

export default NewCourse;