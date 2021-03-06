module.exports = {
  presets: [
    ['@babel/preset-env', {
      modules: false,
    }],
  ],
  plugins: [
    //'transform-vue-jsx',
    //'@babel/plugin-transform-runtime',
    //'@babel/plugin-syntax-dynamic-import',
    ["@babel/plugin-transform-runtime", {
      "corejs": false,
      "helpers": false,
      "regenerator": true,
      "useESModules": false
    }],
  ],
};
