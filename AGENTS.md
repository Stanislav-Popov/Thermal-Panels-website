<!-- @format -->

# Project Instructions

## Source of truth

Before starting any non-trivial task, always read:

- `docs/Technical-specification.md`

## Project structure

- `frontend/` — client application
- `backend/` — server application
- `docs/Technical-specification.md` — main requirements document
- `AGENTS.md` — project rules

## Main goal

Build a fullstack website for decorative thermal facade panels.

The project includes:

- landing page
- product catalog
- calculator
- admin panel

Follow the technical specification strictly.
Do not invent business features that are not described in the specification.

## Working rules

- Make minimal and safe changes.
- Preserve existing project structure unless restructuring is necessary.
- Do not rewrite large parts of the project without need.
- Do not add dependencies unless justified.
- Keep frontend and backend responsibilities separated.
- Reuse components and modules before creating new ones.
- Keep code readable and maintainable.

## Frontend rules

- Use the existing Vite frontend as the base.
- Keep components small and reusable.
- Prefer clear folder structure.
- Maintain adaptive layout for desktop, tablet, and mobile.
- Keep the main CTA visible in important sections.

## Backend rules

- Build only what is required for catalog, calculator support, and admin panel.
- Avoid overengineering.
- Keep API structure simple and predictable.
- Separate routes, controllers, services, and models if backend grows.

## UX and business constraints

- Main user action is cost calculation and contact via phone or messengers.
- No online payment.
- Fixed header is required.
- Contact buttons must remain prominent.
- Calculator and catalog are critical project features.
- Admin panel is required.

## Content and legal constraints

- Do not make absolute claims about energy savings, sound insulation, or product performance unless explicitly confirmed by provided materials.
- Keep wording persuasive but safe.

## Before finishing implementation tasks

Always:

1. run install if needed
2. run build
3. run lint
4. report what was changed

## Forbidden without confirmation

- changing the stack completely
- replacing Vite frontend with another framework
- adding heavy UI libraries without reason
- removing major sections from the specification
- inventing undocumented business logic
