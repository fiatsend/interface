import webpack from 'webpack';

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

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
};

export default nextConfig;