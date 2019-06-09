// @flow

import React from 'react';
import ReactDOM from 'react-dom';

import { App } from './app';
import './index.css';

const el = document.getElementById('root');

if (el) ReactDOM.render(<App />, el);
