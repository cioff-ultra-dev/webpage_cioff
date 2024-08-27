# CIOFF

## Getting Started

> We just recommend `pnpm` resource manager for handling this project.

First time using the project, just proceed to install dependencies:

```sh
pnpm install
```

Secondly, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Configuring Environment

1. Just create a `.env` on the root of the project with the following variables:

> Please, reach out developers team to provide all the variables needed, our database just supported by [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

```env
POSTGRES_URL="************"
POSTGRES_PRISMA_URL="************"
POSTGRES_URL_NO_SSL="************"
POSTGRES_URL_NON_POOLING="************"
POSTGRES_USER="************"
POSTGRES_HOST="************"
POSTGRES_PASSWORD="************"
POSTGRES_DATABASE="************"
```

2. If this process will be configured on another new database or cluster just run `npx drizzle-kit generate && npx drizzle-kit migrate`

2.1. To show db studio: `npx drizzle-kit studio`

#### Contribution

We're open to receive any feedback related to the docs and guideline for provide great experiences for the dev environment.
