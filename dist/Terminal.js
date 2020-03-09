import React, { useEffect, useRef, useState } from "react";
import PropTypes from 'prop-types';
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { AttachAddon } from 'xterm-addon-attach';
import ReconnectingWebSocket from 'reconnecting-websocket';
import "./terminal.css";

const Term = ({
  target,
  workdir,
  user,
  shell
}) => {
  const container = useRef();
  const terminal = useRef();

  const createWebSocket = path => {
    var protocolPrefix = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    var addr = protocolPrefix + '//' + window.location.host + path;
    console.log("Websocket loc:" + addr);
    return new ReconnectingWebSocket(addr);
  };

  useEffect(() => {
    // get the address from the current browser address
    const websocket = createWebSocket(`/terminal?target=${target}&workdir=${workdir}&user=${user}&shell=${shell}`);
    websocket.binaryType = 'arraybuffer';

    const heartbeat = () => {
      websocket.send(new TextEncoder().encode("\x09"));
    }; // set a regular heart beat 


    setInterval(heartbeat, 10000); // Create the terminal

    terminal.current = new XTerm({
      fontFamily: 'Hack, Droid Sans Mono, Monospace',
      fontSize: 14,
      lineHeight: 1.1,
      cursorBlink: true,
      theme: {
        "background": "#011627",
        "black": "#011627",
        "blue": "#82AAFF",
        "brightBlack": "#575656",
        "brightBlue": "#82AAFF",
        "brightCyan": "#7FDBCA",
        "brightGreen": "#22DA6E",
        "brightPurple": "#C792EA",
        "brightRed": "#EF5350",
        "brightWhite": "#FFFFFF",
        "brightYellow": "#FFEB95",
        "cyan": "#21C7A8",
        "foreground": "#D6DEEB",
        "green": "#22DA6E",
        "name": "Night Owl",
        "purple": "#C792EA",
        "red": "#EF5350",
        "white": "#FFFFFF",
        "yellow": "#ADDB67"
      }
    }); // Load addons

    const fitAddon = new FitAddon();
    terminal.current.loadAddon(new AttachAddon(websocket));
    terminal.current.loadAddon(fitAddon); // Handle resizing

    const resize = () => {
      const dimensions = fitAddon.proposeDimensions();
      fitAddon.fit();
      websocket.send(new TextEncoder().encode("\x01" + JSON.stringify({
        cols: dimensions.cols,
        rows: dimensions.rows
      })));
    };

    window.addEventListener('resize', e => resize());
    websocket.addEventListener('open', e => resize());
    terminal.current.onResize(e => resize());
    terminal.current.open(container.current); // Encode our messages to the server

    terminal.current.onData(data => websocket.send(new TextEncoder().encode("\x00" + data)));
  }, [target, workdir, user, shell]);
  return React.createElement("div", {
    ref: container
  });
};

const Terminal = ({
  target,
  workdir = '/',
  user = 'root',
  shell = '/bin/sh',
  placeholder = 'click to expand terminal',
  expanded = false
}) => {
  const [show, setShow] = useState(expanded);
  return React.createElement(React.Fragment, null, show ? React.createElement(Term, {
    target: target,
    workdir: workdir,
    user: user,
    shell: shell
  }) : React.createElement("div", {
    className: "placeholder",
    onClick: () => setShow(true)
  }, React.createElement("svg", {
    className: "icon",
    "aria-hidden": "true",
    focusable: "false",
    viewBox: "0 0 640 512"
  }, React.createElement("path", {
    fill: "#ADDB67",
    d: "M257.981 272.971L63.638 467.314c-9.373 9.373-24.569 9.373-33.941 0L7.029 444.647c-9.357-9.357-9.375-24.522-.04-33.901L161.011 256 6.99 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L257.981 239.03c9.373 9.372 9.373 24.568 0 33.941zM640 456v-32c0-13.255-10.745-24-24-24H312c-13.255 0-24 10.745-24 24v32c0 13.255 10.745 24 24 24h304c13.255 0 24-10.745 24-24z"
  })), placeholder));
};

export default Terminal;
Terminal.propTypes = {
  target: PropTypes.string.isRequired,
  workdir: PropTypes.string,
  user: PropTypes.string,
  shell: PropTypes.string
};