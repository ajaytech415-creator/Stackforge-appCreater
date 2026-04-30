# StackForge

> Generate downloadable project scaffold ZIPs from your chosen tech stack.

![Screenshot](./public/screenshot.png)

## Tech stack

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8) ![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)

## Local development

```bash
git clone https://github.com/your/stackforge
cd stackforge
npm install
cp .env.example .env
npm run dev
```

Open http://localhost:3000.

## Adding a new template

1. Create a builder in `lib/generator/templates/<area>/<name>.ts` returning a string.
2. Wire it into `lib/generator/index.ts` under the appropriate section.
3. Update `lib/generator/fileTree.ts` so the preview reflects the new file.

## Adding a new feature flag

1. Add the key to `FeatureFlags` and `FEATURE_KEYS` in `types/index.ts`.
2. Update the Zod `featureSchema`.
3. Add it to a group in `components/builder/FeatureGrid.tsx`.
4. Reference it from any template that should react to it.

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

`vercel.json` already pins `maxDuration: 30s` for the generate endpoint.

## Contributing

PRs welcome. Run `npm run lint && npm run typecheck` before opening.

## License

MIT © StackForge contributors.
