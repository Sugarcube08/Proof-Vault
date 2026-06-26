import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent SWC/Webpack minifier from mangling classnames and function names, which breaks js-xdr reflection
  webpack: (config) => {
    if (config.optimization && config.optimization.minimizer) {
      config.optimization.minimizer.forEach((minimizer: any) => {
        if (minimizer.options && minimizer.options.minimizer) {
          if (minimizer.options.minimizer.options) {
            minimizer.options.minimizer.options.keep_classnames = true;
            minimizer.options.minimizer.options.keep_fnames = true;
          }
        }
        if (minimizer.options && minimizer.options.terserOptions) {
          minimizer.options.terserOptions.keep_classnames = true;
          minimizer.options.terserOptions.keep_fnames = true;
        }
      });
    }
    return config;
  }
};

export default nextConfig;
