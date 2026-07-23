import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@inside/ui', '@inside/content', '@inside/schemas'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@inside/content': path.resolve(__dirname, '../../packages/content/src'),
      '@inside/schemas': path.resolve(__dirname, '../../packages/schemas/src')
    };
    config.resolve.extensionAlias = {
      ...config.resolve.extensionAlias,
      '.js': ['.ts', '.tsx', '.js'],
      '.jsx': ['.tsx', '.jsx']
    };
    return config;
  }
};

export default nextConfig;
