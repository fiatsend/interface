import webpack from 'webpack';
import withPWA from 'next-pwa';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = withPWA({
    pwa: {
        dest: 'public',
        disable: !isProd,
        register: true,
        skipWaiting: true,
        manifest: '/manifest.json',
        themeColor: '#5D15F2',
    },

    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                stream: 'stream-browserify',
                crypto: 'crypto-browserify',
                buffer: 'buffer',
                fs: false,
            };

            config.plugins.push(
                new webpack.ProvidePlugin({
                    process: 'process/browser', //here's where you highlight process
                    Buffer: ['buffer', 'Buffer'],
                }),
                new webpack.NormalModuleReplacementPlugin(
                    /node:crypto/,
                    (resource) => {
                        resource.request = resource.request.replace(/^node:/, '');
                    }
                )
            );
        }
        return config;
    },
});

export default {
    ...nextConfig,
    reactStrictMode: true,
};