import React, { useState } from 'react';
import { Modal, Button, Stepper, Title, Text, Stack } from '@mantine/core';
import { IconChevronLeft, IconChevronRight, IconX, IconCheck } from '@tabler/icons-react';
import Step1 from '@/app/containers/course/NewCourse/step1/step1';
import Step2 from '@/app/containers/course/NewCourse/step2/step2';

function NewCourse() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoader] = useState(false);

  const steps = [{ title: 'Create Course' }, { title: 'Course Builder' }];

  const onNext = () => {
    setLoader(true);
    setTimeout(() => { setLoader(false); }, 3000);
    setTimeout(() => { setStep(s => s + 1); }, 3500);
  };
  const onPrevious = () => setStep(s => s - 1);
  const onCancel = () => { setStep(1); setOpen(false); };

  return (
    <div>
      <Button color="green" onClick={() => setOpen(true)}>Create Course</Button>
      <Modal opened={open} onClose={() => setOpen(false)} title={steps[step - 1]?.title || 'Create Course'} size="lg" closeOnClickOutside={false}>
        <Stepper active={step - 1} size="sm" mb="md">
          {steps.map((s, i) => <Stepper.Step key={i} label={s.title} />)}
        </Stepper>
        <div style={{ minHeight: 200 }}>
          {step === 1 && <Step1 loading={loading} />}
          {step === 2 && <Step2 loading={loading} />}
        </div>
        <Stack gap="sm" mt="md" style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <div>
            {step > 1 && <Button variant="default" onClick={onPrevious} leftSection={<IconChevronLeft size={14} />}>Previous</Button>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="default" onClick={onCancel} leftSection={<IconX size={14} />}>Cancel</Button>
            {step < 2 && <Button onClick={onNext} loading={loading} rightSection={<IconChevronRight size={14} />}>Next</Button>}
            {step === 2 && <Button color="green" onClick={onCancel} leftSection={<IconCheck size={14} />}>Done</Button>}
          </div>
        </Stack>
      </Modal>
    </div>
  );
}

export default NewCourse;
