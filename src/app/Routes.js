import { Route, Switch } from "react-router-dom";
import React from "react";
import CourseContainer from "./containers/course/Course";
import CourseDetail from "./containers/course/CourseDetail/CourseDetail";
import Dashboard from './containers/Dashboard/Dashboard';

const Routes = () => {
    return (
        <Switch>
            <Route exact path="/" component={Dashboard} />
            <Route exact path="/courses" component={CourseContainer}/>
            <Route exact path="/courses/:id" component={CourseDetail}/>
        </Switch>
    )
}

export default Routes;