
import React from 'react';
import { Header } from 'semantic-ui-react';

import './Dashboard.scss';

class Dashboard extends React.Component {
    render() {
        return (
            <div className="content-center dashboard">
                <Header as="h1">Dashboard</Header>
            </div>
        )
    }
}

export default Dashboard;