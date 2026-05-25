import React from 'react';
import { Dropdown, TextArea, Form, Input } from 'semantic-ui-react';

const states = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana',
  'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts',
  'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska',
  'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina',
  'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
];

const tagOptions = states.map((st) => ({
  key: st,
  text: st,
  value: st,
}));

function Step1(props) {
  return (
    <Form loading={props.loading}>
      <Form.Field required>
        <label>Course Name</label>
        <Input placeholder="Enter a course name" />
      </Form.Field>
      <Form.Field>
        <label>Description</label>
        <TextArea placeholder="Tell something about this course" style={{ minHeight: 100 }} />
      </Form.Field>
      <Form.Field>
        <label>Tags</label>
        <Dropdown
          placeholder="Eg: programming, Business"
          fluid
          multiple
          search
          selection
          options={tagOptions}
        />
      </Form.Field>
      <Form.Field>
        <label>Category </label>
        <Dropdown
          placeholder="Eg: Sports"
          fluid
          search
          selection
          options={tagOptions}
        />
      </Form.Field>
    </Form>
  );
}

export default Step1;
