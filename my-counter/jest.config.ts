import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    // globals: {
    //     BigInt: {
    //       toJSON: function() {
    //         return this.toString();
    //       }
    //     }
    //   }
};

export default config;
