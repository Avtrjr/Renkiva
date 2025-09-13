module.exports = {
  appId: 'com.renkiva.app',
  productName: 'RENKIVA',
  directories: {
    output: 'dist-electron'
  },
  files: [
    'dist/**/*',
    'electron/**/*',
    'node_modules/**/*'
  ],
  extraMetadata: {
    main: 'electron/main.js'
  },
  mac: {
    category: 'public.app-category.video',
    target: [
      {
        target: 'dmg',
        arch: ['x64', 'arm64']
      }
    ]
  },
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64', 'ia32']
      }
    ]
  },
  linux: {
    target: [
      {
        target: 'AppImage',
        arch: ['x64']
      },
      {
        target: 'deb',
        arch: ['x64']
      }
    ],
    category: 'AudioVideo'
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true
  }
};