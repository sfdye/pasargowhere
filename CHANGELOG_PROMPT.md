# Changelog generation prompt

Run this after each `npm run release`. Generates the internal changelog and external release notes in one pass.

1. Run `git tag --sort=-version:refname | head -2` to get the last two tags.
2. Run `git log <previous_tag>..<latest_tag> --format="- %s (%h)"` to list commits between them.
3. Filter out the "Build N of X.Y.Z" commit.
4. Read `app.json` to get the current `expo.version` and `android.versionCode` (the build number just bumped by `npm run release`).

## CHANGELOG.md (internal, dev-facing)

5. Group remaining commits under: **New**, **Improved**, **Fixed**, **Internal** (omit empty headings).
6. Keep commit messages close to original, lightly edited for clarity. Include PR numbers in parentheses.
7. Prepend `## v<version>+<build> — <YYYY-MM-DD>` using the latest tag and its date.
8. Prepend to `CHANGELOG.md` (create if missing).

## External release notes (user-facing, per locale)

9. Rewrite the commits as non-technical, user-facing sentences. No PR numbers, no commit hashes, no jargon. Plain bulleted list (no grouping headings).
10. Write in English and translate to Simplified Chinese.
11. **iOS** — overwrite both files (replaces wholesale each release):
    - `fastlane/metadata/en-US/release_notes.txt`
    - `fastlane/metadata/zh-Hans/release_notes.txt`
12. **Android** — write per-build files named `<versionCode>.txt` (the number from step 4):
    - `fastlane/metadata/android/en-US/changelogs/<versionCode>.txt`
    - `fastlane/metadata/android/zh-CN/changelogs/<versionCode>.txt`

## After generation

13. Show the diffs for `CHANGELOG.md` and the four fastlane files. Ask for confirmation before committing.
