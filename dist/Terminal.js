import React, { useEffect, useRef, useState } from "react";
import PropTypes from 'prop-types';
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { AttachAddon } from 'xterm-addon-attach';
import "./terminal.css";

const Term = ({
  target,
  workdir,
  user,
  shell
}) => {
  const container = useRef();
  const terminal = useRef();
  useEffect(() => {
    const websocket = new WebSocket(`ws://localhost:27950/terminal?target=${target}&workdir=${workdir}&user=${user}&shell=${shell}`);
    websocket.binaryType = 'arraybuffer'; // Create the terminal

    terminal.current = new XTerm({
      fontFamily: 'Hack, Droid Sans Mono, Monospace',
      fontSize: 14,
      lineHeight: 1.1,
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
    terminal.current.loadAddon(fitAddon);
    terminal.current.open(container.current);
    terminal.current.onRender(() => {
      fitAddon.fit();
    }); // Encode our messages to the server

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
  placeholder = 'Click to open terminal'
}) => {
  const [show, setShow] = useState(false);
  return React.createElement(React.Fragment, null, show ? React.createElement(Term, {
    target: target,
    workdir: workdir,
    user: user,
    shell: shell
  }) : React.createElement("div", {
    className: "placeholder",
    onClick: () => setShow(true)
  }, placeholder));
};

export default Terminal;
Terminal.propTypes = {
  target: PropTypes.string.isRequired,
  workdir: PropTypes.string,
  user: PropTypes.string,
  shell: PropTypes.string
};