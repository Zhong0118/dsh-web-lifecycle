import { build, context } from 'esbuild'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const id = pkg.name
const watch = process.argv.includes('--watch')

const EXTERNALS = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-locale',
  '@deepseek-ai/dsh-client-locale/client',
  '@deepseek-ai/dsh-client-ui-settings',
  '@deepseek-ai/dsh-client-ui-settings/client',
]

const cssModulesPlugin = {
  name: 'css-modules',
  setup(buildApi) {
    buildApi.onLoad({ filter: /\.module\.css$/ }, async (args) => {
      const fs = await import('node:fs/promises')
      const source = await fs.readFile(args.path, 'utf8')
      const classes = {}
      const transformed = source.replace(/\.([A-Za-z_][\w-]*)/g, (match, name, offset, full) => {
        // Only rewrite class selectors at the start of a rule-ish token.
        const before = full[offset - 1]
        if (before && /[\w-]/.test(before)) return match
        const hashed = `${name}_${hash(args.path + ':' + name)}`
        classes[name] = hashed
        return `.${hashed}`
      })
      const json = JSON.stringify(classes)
      const js = `const css = ${JSON.stringify(transformed)};
const tagId = ${JSON.stringify(id + '/' + args.path.split('/').pop())};
if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
  const tag = document.createElement("style");
  tag.dataset.plugin = ${JSON.stringify(id)};
  tag.dataset.pluginCss = tagId;
  tag.textContent = css;
  document.head.appendChild(tag);
}
export default ${json};
`
      return { contents: js, loader: 'js' }
    })
  },
}

function hash(value) {
  let h = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(36).slice(0, 6)
}

function wrap(body) {
  return `window.__ModuleLoader__.load({
\tid: ${JSON.stringify(id)},
\tfactory: (require) => {
\t\tvar module = { exports: {} };
\t\tvar exports = module.exports;
\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
${body}
\t\treturn module.exports;
\t}
});
`
}

const clientOptions = {
  absWorkingDir: root,
  entryPoints: [join(root, 'src/client/index.tsx')],
  outfile: join(root, 'lib/client.raw.js'),
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2020',
  external: EXTERNALS,
  jsx: 'automatic',
  sourcemap: false,
  write: false,
  logLevel: 'info',
  charset: 'utf8',
  plugins: [cssModulesPlugin],
}

const hostOptions = {
  absWorkingDir: root,
  entryPoints: [
    join(root, 'src/index.ts'),
    join(root, 'src/restart-helper.ts'),
  ],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'es2022',
  packages: 'external',
  sourcemap: false,
  outdir: join(root, 'lib'),
  logLevel: 'info',
  charset: 'utf8',
}

async function writeClient(result) {
  mkdirSync(join(root, 'lib'), { recursive: true })
  const file = result.outputFiles.find((item) => item.path.endsWith('.js'))
  if (file === undefined) throw new Error('client bundle produced no js output')
  writeFileSync(join(root, 'lib/client.js'), wrap(file.text))
}

if (watch) {
  const host = await context(hostOptions)
  const client = await context(clientOptions)
  await host.watch()
  await client.watch()
  client.onEnd = undefined
  console.log('watching')
} else {
  await build(hostOptions)
  const client = await build(clientOptions)
  await writeClient(client)
}
