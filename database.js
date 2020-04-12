const Keyv = require('keyv');

const { dbPath } = require('./config.json');

const map = new Map();
exports.getKeyvForGuild = (id) => {
  if (map.has(id)) {
    return map.get(id);
  } else {
    const keyv = new Keyv(dbPath, { namespace: id.toString() });
    keyv.on('error', err => {
      console.error(`(${id}) Keyv connection error:`, err);
      return undefined;
    });
    map.set(id, keyv);
    return map.get(id);
  }
};
