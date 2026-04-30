import type { AppConfig, TargetConfig } from '@/types'

export function buildElectronPackageJson(
  app: AppConfig,
  targets: TargetConfig,
  _entryFile: string,
): string {
  const buildConfig: Record<string, unknown> = {
    appId: app.appId || `com.stackforge.${app.appName.toLowerCase().replace(/\s+/g, '')}`,
    productName: app.appName,
    copyright: app.copyright || `Copyright © ${new Date().getFullYear()} ${app.authorName}`,
    directories: { output: 'dist-electron', buildResources: 'build' },
    // Include everything except build output and node_modules
    files: [
      '**/*',
      '!dist-electron${/*}',
      '!.git${/*}',
    ],
    // Use PNG for all platforms — electron-builder auto-converts to ICO/ICNS
    icon: 'build/icon',
    asar: false, // Disable asar to avoid issues with server-mode apps
  }

  if (targets.windows) {
    buildConfig.win = {
      target: [{ target: 'nsis', arch: ['x64'] }],
      icon: 'build/icon.ico',
    }
    buildConfig.nsis = {
      oneClick: false,
      perMachine: false,
      allowToChangeInstallationDirectory: true,
      createDesktopShortcut: true,
      createStartMenuShortcut: true,
      installerIcon: 'build/icon.ico',
      uninstallerIcon: 'build/icon.ico',
    }
  }

  if (targets.macos) {
    buildConfig.mac = {
      target: [{ target: 'dmg', arch: ['x64', 'arm64'] }],
      icon: 'build/icon.icns',
      category: 'public.app-category.utilities',
    }
    buildConfig.dmg = {
      contents: [
        { x: 130, y: 220 },
        { x: 410, y: 220, type: 'link', path: '/Applications' },
      ],
    }
  }

  if (targets.linux) {
    buildConfig.linux = {
      target: [{ target: 'AppImage', arch: ['x64'] }],
      icon: 'build/icon.png',
      category: 'Utility',
    }
  }

  const pkg = {
    name: app.appName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    version: app.version || '1.0.0',
    description: app.description || `${app.appName} — built with StackForge`,
    author: app.authorEmail
      ? `${app.authorName} <${app.authorEmail}>`
      : app.authorName || 'StackForge',
    main: 'main.js',
    scripts: {
      start: 'electron .',
      pack: 'electron-builder --dir',
      dist: 'electron-builder',
    },
    dependencies: {},
    devDependencies: {
      electron: '^28.0.0',
      'electron-builder': '^24.13.3',
    },
    build: buildConfig,
  }

  return JSON.stringify(pkg, null, 2)
}
