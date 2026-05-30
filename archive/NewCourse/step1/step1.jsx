import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader } from 'lucide-react';

const states = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

const tagOptions = states.map((st) => ({ value: st, label: st }));

function Step1(props) {
  if (props.loading) return (
    <div className="flex flex-col items-center justify-center p-8 gap-2">
      <Loader size={16} className="animate-spin text-text-muted" />
      <p className="text-sm text-text-muted">Loading...</p>
    </div>
  );
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-text-primary">Course Name</label>
        <Input placeholder="Enter a course name" className="mt-1" />
      </div>
      <div>
        <label className="text-xs font-medium text-text-primary">Description</label>
        <Textarea placeholder="Tell something about this course" rows={4} className="mt-1" />
      </div>
      <div>
        <label className="text-xs font-medium text-text-primary">Tags</label>
        <Input placeholder="Eg: programming, Business" className="mt-1" />
      </div>
      <div>
        <label className="text-xs font-medium text-text-primary">Category</label>
        <Input placeholder="Eg: Sports" className="mt-1" />
      </div>
    </div>
  );
}

export default Step1;
