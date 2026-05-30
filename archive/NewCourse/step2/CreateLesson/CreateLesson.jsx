import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, X } from 'lucide-react';

function CreateLesson() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  function onSubmit() { setLoading(true); setTimeout(() => setLoading(false), 3000); setTimeout(() => setOpen(false), 3500); }
  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>Create Lesson</Button>
      <Dialog open={open} onOpenChange={() => setOpen(false)}>
        {open && (
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>Create Lesson</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-text-primary">Title</label>
                <Input placeholder="Enter a title name" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-text-primary">Description</label>
                <Textarea placeholder="Tell something about this lesson" rows={4} className="mt-1" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="default" onClick={() => setOpen(false)}><X size={14} /> Cancel</Button>
              <Button onClick={onSubmit} disabled={loading}><Check size={14} /> Submit</Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

export default CreateLesson;
