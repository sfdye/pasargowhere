# Changelog

## v1.0.0+5 — 2026-08-31

### Fixed

- Fix Chinese notification copy and collapse long-closure reminders (#69)

## v1.0.0+4 — 2026-08-31

### Improved

- iPad screenshot support and auto-resize for ASC upload (#65)

### Fixed

- Fix Discover status ignoring NEA closures; extract getDisplayStatus helper (#68)

### Internal

- Rename AsyncStorage keys from oa_ to pg_ prefix (#66)
- Add .worktrees/ to .gitignore to exclude from EAS build archive (#67)

## v1.0.0+3 — 2026-08-29

### New

- Add operating hours from Google Maps (#62)

### Improved

- Adopt the new awning mark as the app icon (#64)

## v1.0.0+2 — 2026-08-25

### Improved

- Surface NEA description in market detail and search (#55)
- Refine Monday closure presentation and coalesce closure ranges (#54)

## v1.0.0+1 — 2026-08-24

### New

- Rebrand to PasarGuru with discovery-first information architecture (#52)
- Fastlane store metadata scaffold for App Store and Google Play (#47)
- Privacy policy page for App Store submission (#43)
- OneMap logo and Singapore Open Data Licence attribution (#46)
- Over-the-air updates via EAS Update (#30)
- Chinese names for every market (#28)
- Maestro E2E testing framework (#41)
- Dev build variant with its own identity (#10)
- AGENTS.md for agent conventions

### Improved

- Hierarchical settings sub-pages with appearance setting (#50)
- OneMap Night tiles in dark mode (#48)
- Google Maps as auto default on iOS when installed (#35)
- Default the map to user's location on first visit, restore last view afterwards (#33)
- iOS Dynamic Type support for accessibility text sizes (#31)
- Send address to whichever map app the phone actually has (#26)
- Constrain map to Singapore coastline instead of drifting into nothing (#23)
- Cap favorites at ten markets to match reminder queue ceiling (#22)
- Floating add button positioned for thumb reach (#19)
- Consistent back chevron across all screens (#18)
- Normalise dataset once on arrival instead of at every read site
- Single swiped-open row enforcement on Today list

### Fixed

- Fix e2e settings flow and iOS favorites swipe (#51)
- Fix locate button zooming to stale location instead of the blue dot (#42)
- Fix EAS build archive bloat from .easignore overriding .gitignore (#56)
- Keep Today row chevrons within their layout bounds (#34)
- Fix back button label leaking "(tabs)"
- Stop claiming a market is open right now
- Open the right market when a reminder is tapped
