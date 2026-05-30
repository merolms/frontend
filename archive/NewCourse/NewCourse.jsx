import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Stepper } from '@/components/ui/stepper';
import Step1 from '@/app/containers/course/NewCourse/step1/step1';
import Step2 from '@/app/containers/course/NewCourse/step2/step2';

function NewCourse() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const steps = [{ title: 'Create Course' }, { title: 'Course Builder' }];

  const onNext = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); }, 3000);
    setTimeout(() => { setStep(s => s + 1); }, 3500);
  };
  const onPrevious = () => setStep(s => s - 1);
  const onCancel = () => { setStep(1); setOpen(false); };

  return (
    <div>
      <Button variant="green" onClick={() => setOpen(true)}>Create Course</Button>
      <Dialog open={open} onOpenChange={() => setOpen(false)}>
        {open && (
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{steps[step - 1]?.title || 'Create Course'}</DialogTitle>
            </DialogHeader>
            <Stepper steps={steps} current={step} className="mb-4" />
            <div style={{ minHeight: 200 }}>
              {step === 1 && <Step1 loading={loading} />}
              {step === 2 && <Step2 loading={loading} />}
            </div>
            <div className="flex items-center justify-between mt-4">
              <div>
                {step > 1 && (
                  <Button variant="default" onClick={onPrevious}><ChevronLeft size={14} /> Previous</Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="default" onClick={onCancel}><X size={14} /> Cancel</Button>
                {step < 2 && <Button onClick={onNext} disabled={loading}><ChevronRight size={14} /> Next</Button>}
                {step === 2 && <Button variant="green" onClick={onCancel}><Check size={14} /> Done</Button>}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

export default NewCourse;
