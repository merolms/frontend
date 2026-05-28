import React from 'react';
import { TextInput, Textarea, MultiSelect, Stack, Loader } from '@mantine/core';

const states = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

const tagOptions = states.map((st) => ({ value: st, label: st }));

function Step1(props) {
  if (props.loading) return <Stack align="center" p="xl"><Loader /><div>Loading...</div></Stack>;
  return (
    <Stack>
      <TextInput label="Course Name" placeholder="Enter a course name" required />
      <Textarea label="Description" placeholder="Tell something about this course" minRows={4} />
      <MultiSelect label="Tags" placeholder="Eg: programming, Business" data={tagOptions} searchable />
      <MultiSelect label="Category" placeholder="Eg: Sports" data={tagOptions} searchable />
    </Stack>
  );
}

export default Step1;
