import { Route, Switch } from "react-router-dom";
import React from "react";
import CourseContainer from "./containers/course";

const Routes = () => {
    return (
        <Switch>
            <Route exact path="/" render={() => <div>Dashboard</div>}/>
            <Route exact path="/courses" component={CourseContainer}/>
        </Switch>
    )
}

export default Routes;