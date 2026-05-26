This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Looking Up an Item Name by typeID

The app exposes a small JSON endpoint that returns the raw SDE record for a
given `typeID`. The item name lives at `name.en` (CCP's localized form).

```bash
# Erebus (Titan)
curl -s http://localhost:3000/api/type/671 | jq -r '.name.en'
# → Erebus
```

From JavaScript / TypeScript:

```ts
async function lookupName(typeID: number): Promise<string | null> {
  const res = await fetch(`/api/type/${typeID}`);
  if (!res.ok) return null;
  const type = (await res.json()) as { name?: { en?: string } | string };
  return typeof type.name === "string" ? type.name : (type.name?.en ?? null);
}

await lookupName(671); // "Erebus"
```

The endpoint returns `404` if the `typeID` is not present in the bundled SDE.

## Looking Up a Blueprint by Product typeID

Pass the typeID of an item you want to build and `/api/blueprint/[typeID]`
returns the raw blueprint record that produces it (materials, products,
times, etc.). Lookup is by `activities.manufacturing.products[].typeID`.

```bash
# Find the blueprint that builds an Erebus (Titan, typeID 671)
curl -s http://localhost:3000/api/blueprint/671 \
  | jq '.activities.manufacturing.materials'
```

Returns `404` if no manufacturing blueprint in the bundled SDE produces
that typeID.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
