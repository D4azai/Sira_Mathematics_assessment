import { json, VERSION } from '../lib/session.js';
import { runtimeReadiness } from '../lib/config.js';
import { endpoint } from '../lib/http.js';
export default endpoint('GET', async (req, res) => {
  const flags = await runtimeReadiness();
  return json(res, 200, { ...flags, ready: Object.values(flags).every(Boolean), version: VERSION });
});
