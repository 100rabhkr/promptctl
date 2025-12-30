# Contributing to promptctl

We love your input! We want to make contributing to promptctl as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features

## Getting Started

1.  Clone the repo:
    ```bash
    git clone https://github.com/yourusername/promptctl.git
    cd promptctl
    ```
2.  Install dependencies (requres pnpm):
    ```bash
    pnpm install
    ```
3.  Build all packages:
    ```bash
    pnpm run build
    ```

## Development Workflow

We use [Turbo Repo](https://turbo.build/) to manage the monorepo.

- **Run all tests**: `pnpm run test`
- **Build**: `pnpm run build`
- **Dev mode (CLI)**:
    ```bash
    pnpm -C packages/cli dev
    ```

## Pull Request Process

1.  Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
2.  Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent.
3.  You may merge the Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.
