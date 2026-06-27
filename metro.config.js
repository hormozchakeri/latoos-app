const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// NativeWind can reset this flag; re-enable it so Metro resolves
// @react-native/* packages that use package.json "exports" (required for RN 0.79+)
const nativeWindConfig = withNativeWind(config, { input: "./global.css" });
nativeWindConfig.resolver.unstable_enablePackageExports = true;

module.exports = nativeWindConfig;
