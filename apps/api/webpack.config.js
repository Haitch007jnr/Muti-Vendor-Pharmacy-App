module.exports = function (options, webpack) {
  return {
    ...options,
    externals: [
      // Mark bcrypt and other native modules as external
      'bcrypt',
      'pg-native',
      'sqlite3',
      'tedious',
      'mysql',
      'mysql2',
      'oracledb',
      'better-sqlite3',
    ],
    output: {
      ...options.output,
      libraryTarget: 'commonjs2',
    },
  };
};
