import React, { useEffect, useRef } from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebglAddon } from 'xterm-addon-webgl';
import { AttachAddon } from 'xterm-addon-attach';
import "./terminal.css";
export const Terminal = () => {
  const container = useRef();
  const terminal = useRef();
  useEffect(() => {
    const websocket = new WebSocket(`ws://localhost:27950/terminal`);
    websocket.binaryType = 'arraybuffer';
    terminal.current = new XTerm();
    terminal.current.loadAddon(new AttachAddon(websocket));
    terminal.current.open(container.current);
    terminal.current.loadAddon(new WebglAddon());
    terminal.current.onRender(() => {
      const fitAddon = new FitAddon();
      terminal.current.loadAddon(fitAddon);
      fitAddon.fit();
    });
    terminal.current.onData(data => websocket.send(new TextEncoder().encode("\x00" + data)));
  }, [websocket]);
  return React.createElement("div", {
    ref: container
  });
};