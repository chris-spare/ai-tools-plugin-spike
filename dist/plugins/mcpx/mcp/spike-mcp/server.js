#!/usr/bin/env node
// Minimal self-contained MCP stdio server for the plugin spike (demo data only, no deps).
// Speaks newline-delimited JSON-RPC: initialize, tools/list, tools/call.
'use strict';
const send = (msg) => process.stdout.write(JSON.stringify(msg) + '\n');
let buf = '';
process.stdin.on('data', (d) => {
  buf += d.toString();
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i).trim();
    buf = buf.slice(i + 1);
    if (!line) continue;
    let msg;
    try { msg = JSON.parse(line); } catch { continue; }
    handle(msg);
  }
});
function handle(msg) {
  const { id, method } = msg;
  if (method === 'initialize') {
    send({ jsonrpc: '2.0', id, result: {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      serverInfo: { name: 'spike-mcp', version: '1.0.0' },
    }});
  } else if (method === 'tools/list') {
    send({ jsonrpc: '2.0', id, result: { tools: [
      { name: 'spike_ping', description: 'Returns SPIKE_MCP_PONG for the spike MCP test.', inputSchema: { type: 'object', properties: {} } },
    ]}});
  } else if (method === 'tools/call') {
    send({ jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: 'SPIKE_MCP_PONG' }] } });
  } else if (typeof method === 'string' && method.startsWith('notifications/')) {
    // notifications get no response
  } else if (id !== undefined) {
    send({ jsonrpc: '2.0', id, result: {} });
  }
}
