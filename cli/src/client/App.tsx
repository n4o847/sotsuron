import React, { useEffect, useState } from 'react';
import { HashRouter, NavLink, Route, Switch } from 'react-router-dom';
import StatsPage from './pages/Stats';
import QueuePage from './pages/Queue';
import CrashesPage from './pages/Crashes';
import ExplorerPage from './pages/Explorer';

export default function App() {
  useEffect(() => {
    fetch('/api/hello')
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      });
  }, []);

  return (
    <HashRouter>
      <div className="container my-5">
        <h1>AFL++</h1>
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <NavLink to="/stats" className="nav-link" activeClassName="active">
              Stats
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/queue" className="nav-link" activeClassName="active">
              Queue
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/crashes"
              className="nav-link"
              activeClassName="active"
            >
              Crashes
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/explorer"
              className="nav-link"
              activeClassName="active"
            >
              Explorer
            </NavLink>
          </li>
        </ul>
        <div className="my-1">
          <Switch>
            <Route path="/stats">
              <StatsPage />
            </Route>
            <Route path="/queue">
              <QueuePage />
            </Route>
            <Route path="/crashes">
              <CrashesPage />
            </Route>
            <Route path="/explorer">
              <ExplorerPage />
            </Route>
          </Switch>
        </div>
      </div>
    </HashRouter>
  );
}
