// Copyright 2016-2017 Gabriele Rigo

import './assets/fonts/Roboto/font.css';
import './style.css';

import React from 'react';
import ReactDOM from 'react-dom';
import './style.css';
import Application from './Application';
import registerServiceWorker from './registerServiceWorker';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

ReactDOM.render(<Application />, document.getElementById('root'));
registerServiceWorker();

/*
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>RigoBlock</title>
  </head>
  <body>
    <div id="container"></div>
    <!--script src="/parity-utils/parity.js"></script-->
    <script src="dist/rigoblock.js"></script>
  </body>
</html>
*/
