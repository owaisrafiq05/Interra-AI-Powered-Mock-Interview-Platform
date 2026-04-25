"use strict";
/**
 * Node 24+ removed `SlowBuffer`. Legacy packages (e.g. buffer-equal-constant-time)
 * touch `SlowBuffer.prototype` at load time. Alias SlowBuffer to Buffer before any
 * such module loads. Safe for JWT paths that use crypto.timingSafeEqual on modern Node.
 */
const buffer = require("buffer");
if (typeof buffer.SlowBuffer === "undefined") {
  buffer.SlowBuffer = buffer.Buffer;
}
