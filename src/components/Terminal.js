import React, {useEffect, useRef} from "react"
import PropTypes from 'prop-types'
import { Terminal as XTerm } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import { WebglAddon } from 'xterm-addon-webgl'
import { AttachAddon } from 'xterm-addon-attach'

import "./terminal.css"

export const Terminal = ({ target, workdir = '/', user = 'root', shell = '/bin/sh' }) => {
    const container = useRef()
    const terminal = useRef()
    
    const websocket = new WebSocket(`ws://localhost:27950/terminal?target=${target}&workdir=${workdir}&user=${user}&shell=${shell}`)
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
    }, [websocket])

    return (
        <div ref={container} />
    )
}

Terminal.propTypes = {
    target: PropTypes.string.isRequired,
    workdir: PropTypes.string,
    user: PropTypes.string,
    shell: PropTypes.string
  }