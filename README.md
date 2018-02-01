This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

## Development environment

**Parity dev server:**  

[https://srv03.endpoint.network/](https://srv03.endpoint.network/)

Please contact the administrator for username and password.

**Webserver:**  

[https://appdev.endpoint.network/](https://appdev.endpoint.network/)

Please contact the administrator for username and password.

**FTP server:**

[ftp://srv03.endpoint.network/](ftp://srv03.endpoint.network/)

The FTP server accepts TLS over TLS only.

Please contact the administrator for username and password.

**SSH**

Login to `srv03.endpoint.network` on port 5555.


## Cloning this repository

Login to the server with username `rigoblock` and enter folder `/home/rigoblock/html/appdev.endpoint.network/public_html`:

    cd /home/rigoblock/html/appdev.endpoint.network/public_html

clone the repository into folder `my-new-app`

    git clone https://github.com/RigoBlock/webapp my-new-app 

Rename the destination folder as you wish.

Enter the folder and create a build folder:

    cd my-new-app
	mkdir build

create a symlink to Parity dapp folder such as:

    ln -s /home/rigoblock/html/appdev.endpoint.network/public_html/rigoblock-david/build/ /home/rigoblock/cluster/parity-config/dapps/my-new-app

and restart Parity:

    cd /home/rigoblock/cluster
    screen -r parity

enter CTRL+C to stop Parity and then restart:

    ./start-parity-node.sh

detach from screen with CTRL+A+D. You can reattach at any time to Parity screen session with:

    screen -r parity

User yarn or npm to download the modules:

    cd /home/rigoblock/html/appdev.endpoint.network/public_html/my-new-app
    yarn

You can now start the node development server with `yarn start`. The app will be available at `http://appdev.endpoint.network:3000`or if that port is not available it will ask you to run the server on a different port. for example, if port `3000` is not available, the server will run on port `3001`.

Alternatively you can ran `yarn watch` and the app bill be built into the build directory and therefore made available in Parity UI under the application tabs.

## Building for beta.rigoblock.com

Please run the following commands. 

    git clone https://github.com/RigoBlock/webapp app
    cd app
    sudo npm install -g yarn
    npm install
    cd webapp/scripts
    chmod +x deploy-cloudflare.sh
    ./deploy-cloudflare.sh

Copy the files inside the `build` directory to the document root folder of your webserver.

## Visual Studio Code

If you code with Visual Studio Code and have the add-on [ftp-sync](https://github.com/lukasz-wronski/vscode-ftp-sync) installed please put the following config in your `ftp-sync.json` inside the `.vscode` folder:
    
    {
    "remotePath": "./html/appdev.endpoint.network/public_html/my-new-app",
    "host": "srv03.endpoint.network",
    "username": "rigoblock",
    "password": "*******",
    "port": 21,
    "secure": true,
    "protocol": "ftp",
    "uploadOnSave": true,
    "passive": true,
    "debug": false,
    "privateKeyPath": null,
    "passphrase": null,
    "ignore": [
    "\\.vscode",
    "\\.git",
    "\\.DS_Store"
    ]
    }

Finally run the following to fix connection to FTP over TLS.

In Linux:

    export NODE_TLS_REJECT_UNAUTHORIZED="0"

In Windows:

    setx NODE_TLS_REJECT_UNAUTHORIZED 0





