import React, { useEffect, useRef } from "react";
import PropTypes from 'prop-types';
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebglAddon } from 'xterm-addon-webgl';
import { AttachAddon } from 'xterm-addon-attach';
import "./terminal.css";

const Terminal = ({
  target,
  workdir = '/',
  user = 'root',
  shell = '/bin/sh'
}) => {
  const container = useRef();
  const terminal = useRef();
  useEffect(() => {
    const websocket = new WebSocket(`ws://localhost:27950/terminal?target=${target}&workdir=${workdir}&user=${user}&shell=${shell}`);
    websocket.binaryType = 'arraybuffer';
    const fitAddon = new FitAddon();
    terminal.current = new XTerm({
      fontFamily: 'Hack',
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
    }); // Attach to the shell

    terminal.current.loadAddon(new AttachAddon(websocket)); // Create the terminal

    terminal.current.open(container.current); // Enable WebGL

    terminal.current.loadAddon(new WebglAddon());
    terminal.current.loadAddon(fitAddon);
    terminal.current.onRender(() => {
      fitAddon.fit();
    }); // Encode our messages to the server

    terminal.current.onData(data => websocket.send(new TextEncoder().encode("\x00" + data)));
  }, [target, workdir, user, shell]);
  return React.createElement("div", {
    ref: container
  });
};

export default Terminal;
Terminal.propTypes = {
  target: PropTypes.string.isRequired,
  workdir: PropTypes.string,
  user: PropTypes.string,
  shell: PropTypes.string
};