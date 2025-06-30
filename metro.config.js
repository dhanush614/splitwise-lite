// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  // Enable supporting .cjs files used by Firebase Auth
  config.resolver.sourceExts.push('cjs');

  // Disable strict package exports resolution
  config.resolver.unstable_enablePackageExports = false;

  return config;
})();
