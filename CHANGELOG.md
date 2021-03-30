# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.3.0](https://github.com/slater-notes/web/compare/v0.2.0...v0.3.0) (2021-03-30)


### ⚠ BREAKING CHANGES

* **editor:** changing editor library will break previously saved notes

### Features

* **editor:** use slatejs instead of draftjs ([ad1e563](https://github.com/slater-notes/web/commit/ad1e56306f2d4302a22ff1a91e60f6b6daf32427))
* add ability to signup with cloud sync enabled ([db41d91](https://github.com/slater-notes/web/commit/db41d915672721c416ead000ce084426b5170fb0))
* add privacy notice for username ([106fb4b](https://github.com/slater-notes/web/commit/106fb4b9666c056e376de4e2b014a9059b38ed84))
* auto focus username input in signup page ([8b6fafa](https://github.com/slater-notes/web/commit/8b6fafaa98f060ef325eb5b105a6efdfef6ca2fd))
* enforce alphanumeric username ([afc255e](https://github.com/slater-notes/web/commit/afc255e01693d7d276488fe727f32085df1628ad))


### Bug Fixes

* dont show errors on empty input in signup page ([fe9a89c](https://github.com/slater-notes/web/commit/fe9a89c4a3c4fcad300a695a71ce952767b263b7))
* fix not loading default app settings ([6b53df1](https://github.com/slater-notes/web/commit/6b53df12605b5764cbb4e1b8d74e6b4331faea8c))
* prevent unnecessary focus on note title input ([65c8d12](https://github.com/slater-notes/web/commit/65c8d126fbd35468984cb50c8edbb7849a59fde4))

## [0.2.0](https://github.com/slater-notes/web/compare/v0.1.9...v0.2.0) (2021-03-22)


### ⚠ BREAKING CHANGES

* **editor:** Content on the old editor are not coverted to the new one therefore losing data.

### Features

* **editor:** use draft.js instead of editor.js ([c99537a](https://github.com/slater-notes/web/commit/c99537ae703342a3d6601a47cfdbf21d5f949e1e))
* bump dependencies ([29a7fc6](https://github.com/slater-notes/web/commit/29a7fc6382f49d48b17f9e21a71f18da2c387909))
* change last sync text ([f7708a7](https://github.com/slater-notes/web/commit/f7708a7f7125b57818f7e25859314c91f06459a3))

### [0.1.9](https://github.com/slater-notes/web/compare/v0.1.8...v0.1.9) (2021-03-16)


### Features

* **editor:** add inline toolbar for heading blocks ([7837ef8](https://github.com/slater-notes/web/commit/7837ef82739379e51fda7e10b07ff4654aeed65b))
* update last cloud sync time ([54d517c](https://github.com/slater-notes/web/commit/54d517cd5b7fe0f2698e15f13228e16d3f54d167))


### Bug Fixes

* show last sync time on cloud sync dialog mount ([c392689](https://github.com/slater-notes/web/commit/c39268949b7b48c79f717ac0deb229017354e5bf))
* **editor:** use h2 heading as default ([ca035d0](https://github.com/slater-notes/web/commit/ca035d0f2fd489053fc72e334157010baf83a4c1))
* correct about section info ([65b0f6b](https://github.com/slater-notes/web/commit/65b0f6b231970945a6a52ab6694d731b8bc9480b))

### [0.1.8](https://github.com/slater-notes/web/compare/v0.1.7...v0.1.8) (2021-03-15)


### Features

* **ui:** improve note section ui ([6ff87ef](https://github.com/slater-notes/web/commit/6ff87efb6c8ae694a058f3a762bc8f80c8b49bc9))
* **ui:** improve sidebar ui ([a380115](https://github.com/slater-notes/web/commit/a3801154028ae57c270d75e7cbf24bd7e00558c5))
* **ui:** use bold font in login, signup page ([2854087](https://github.com/slater-notes/web/commit/285408721165146b3cb84466aa19ff06c81e09ff))

### [0.1.7](https://github.com/slater-notes/web/compare/v0.1.6...v0.1.7) (2021-03-15)


### Features

* **ui:** change font from roboto to inter ([22a6fea](https://github.com/slater-notes/web/commit/22a6feaf4f0c0b36e7839e37f96d1c2d83daadfb))

### [0.1.6](https://github.com/slater-notes/web/compare/v0.1.5...v0.1.6) (2021-03-12)


### Bug Fixes

* remove prod-only code ([99fe2d5](https://github.com/slater-notes/web/commit/99fe2d5d650f6fa39fb391b3c91e2ad2ba845ab5))

### [0.1.5](https://github.com/slater-notes/web/compare/v0.1.4...v0.1.5) (2021-03-12)


### Bug Fixes

* **cloudsync:** use production cloud sync url ([78831ec](https://github.com/slater-notes/web/commit/78831ecd99d5d2ba4fcd2995a2aaf95df37a0231))

### [0.1.4](https://github.com/slater-notes/web/compare/v0.1.3...v0.1.4) (2021-03-12)


### Bug Fixes

* update @slater-notes/core and other libs ([5783a70](https://github.com/slater-notes/web/commit/5783a70745d27fa077cec923f546462ed77a5405))

### [0.1.3](https://github.com/slater-notes/web/compare/v0.1.2...v0.1.3) (2021-03-10)


### Bug Fixes

* fix serverless spa ([d764762](https://github.com/slater-notes/web/commit/d764762e0d462b788174edc5b203047a2c4bd9a9))

### [0.1.2](https://github.com/slater-notes/web/compare/v0.1.1...v0.1.2) (2021-03-10)


### Bug Fixes

* remove unused vars ([f87d692](https://github.com/slater-notes/web/commit/f87d6926ec88ecb3a6f26e16fb02d1a4db6229a9))

### 0.1.1 (2021-03-10)


### Bug Fixes

* update yarn.lock file ([f6ef583](https://github.com/slater-notes/web/commit/f6ef583bb204959755e90e418e4d1dc0170409b7))
