import React, {useEffect, useRef} from "react";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebglAddon } from 'xterm-addon-webgl';
import { AttachAddon } from 'xterm-addon-attach';

import "./terminal.css";

export const Terminal = ({ host, port }) => {
    const container = useRef();
    const terminal = useRef();

    const websocket = new WebSocket(`ws://${host}:${port}/terminal`)
    websocket.binaryType = 'arraybuffer'

    useEffect(() => {
        terminal.current = new XTerm()
        terminal.current.loadAddon(new AttachAddon(websocket))
        terminal.current.open(container.current)
        terminal.current.loadAddon(new WebglAddon())
        terminal.current.onRender(() => {
            const fitAddon = new FitAddon()
            terminal.current.loadAddon(fitAddon)
            fitAddon.fit()
        })

        terminal.current.onData(data => websocket.send(new TextEncoder().encode("\x00" + data)))
    }, [host, port, websocket])

    return (
        <div ref={container} style={{ height: "100%", width: "100%" }} />
    )
}