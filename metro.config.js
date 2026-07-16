const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withModuleFederation } = require('@module-federation/metro');
const { withZephyr } = require('zephyr-metro-plugin');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
    resolver: { useWatchman: false },
};

async function getConfig() {
    const zephyrConfig = await withZephyr()({
        name: 'miniApp',
        filename: 'miniApp.bundle',
        exposes: {
            './example': './src/example.tsx',
        },
        shared: {
            react: {
                singleton: true,
                eager: false,
                requiredVersion: '19.2.3',
                version: '19.2.3',
                import: false,
            },
            'react-native': {
                singleton: true,
                eager: false,
                requiredVersion: '0.84.1',
                version: '0.84.1',
                import: false,
            },
        },
        shareStrategy: 'version-first',
    });
  
    return withModuleFederation(
        mergeConfig(getDefaultConfig(__dirname), config),
        zephyrConfig,
        {
            flags: {
                unstable_patchHMRClient: true,
                unstable_patchInitializeCore: true,
                unstable_patchRuntimeRequire: true,
            },
        },
    );
}

module.exports = getConfig();
