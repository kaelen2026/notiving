const path = require("node:path");
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = {
  watchFolders: [monorepoRoot],
  resolver: {
    unstable_enablePackageExports: true,
    disableHierarchicalLookup: true,
    nodeModulesPaths: [
      path.resolve(projectRoot, "node_modules"),
      path.resolve(monorepoRoot, "node_modules"),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);
