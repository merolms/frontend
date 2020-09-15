import React from 'react'
import {Dropdown, TextArea, Form, Input} from 'semantic-ui-react';
import faker from 'faker'
import _ from 'lodash'

function Step1(props){
    const addressDefinitions = faker.definitions.address
    const tagOptions = _.map(addressDefinitions.state, (state, index) => ({
        key: addressDefinitions.state_abbr[index],
        text: state,
        value: addressDefinitions.state_abbr[index],
    }))
    return (
        <Form loading={props.loading}>
            <Form.Field required>
                <label>Course Name</label>
                <Input placeholder='Enter a course name' />
            </Form.Field>
            <Form.Field>
                <label>Description</label>
                <TextArea placeholder='Tell something about this course' style={{ minHeight: 100 }} />
            </Form.Field>
            <Form.Field>
                <label>Tags</label>
                <Dropdown
                    placeholder='Eg: programming, Business'
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
                    placeholder='Eg: Sports'
                    fluid
                    search
                    selection
                    options={tagOptions}
                />
            </Form.Field>
        </Form>
    )
}

export default Step1 