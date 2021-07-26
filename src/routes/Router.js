import React, {Component} from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';

import ModelRouters from './ModelRouters';

export default class RootRouter extends Component {

    constructor(props) {
        super(props);
        this.state = {}
    }

    render() {
        const routes = this.getComponents().map((item, index) => {
            return (
                <Route
                    exact
                    key={index}
                    path={item.path}
                    render={props =>
                            <item.component key={props.match.params.type}{...props}/>
                    }
                />
            );
        });
        return (
            <Switch>
                {routes}
                {/* <Redirect from="*" to="/" /> */}
            </Switch>
        )
    }

    getComponents = () => {
        let components = [];
        components.push(...ModelRouters);
        return components;
    }
}
