PasarGuru App Review Information

PURPOSE AND AUDIENCE
PasarGuru is a free utility for Singapore residents, especially seniors, who want to check whether a hawker centre or wet market is open before travelling there. It covers all 123 publicly listed NEA-managed locations, shows open/closed status and upcoming closures, and provides optional local reminders. It solves the problem that the public NEA closure schedule is difficult to check quickly.

REVIEW FLOW AND SCREEN RECORDING
The physical-device screen recording attached to the App Store Connect reply starts by launching the app and demonstrates the typical flow: browse Discover, tap "Enable location to sort by distance" and allow location, open a market detail page, save a market, open My Pasars, enable closure reminders and allow notifications, open the Map, and visit Settings to show the language option.

The app has no account registration, login, account deletion, paid content, subscriptions, in-app purchases, user-generated content, messaging, reporting, blocking, or sample files. The only permission prompts are foreground location, requested after the user taps the location action, and local notifications, requested after the user enables reminders. Both prompts are demonstrated in the recording.

TEST DEVICES
We tested the submitted build on these physical devices through TestFlight:
- iPhone 17, iOS 27.0
- iPhone 16 Pro, iOS 26.6.1
- iPhone 16 Plus, iOS 26.6.1
- iPhone 15, iOS 26.6
- iPhone 14, iOS 18.7.8

SETUP AND ACCESS
No account, login, credentials, authentication code, or sample file is required. Install and launch the app, then tap the location action if distance sorting is desired. Tap a market row to view its closure schedule and tap the star to follow it. The My Pasars tab contains the reminder control. The app works with the bundled/cached dataset if the network is unavailable.

EXTERNAL SERVICES
- data.gov.sg (https://data.gov.sg/datasets/d_bda4baa634dd1cc7a6c7cad5f19e2d68/view): the app downloads the public "Dates of Hawker Centre Closure" dataset from Singapore's National Environment Agency. No API key or account is required.
- OneMap (https://www.onemap.gov.sg): the map loads tiles from the Singapore Land Authority's OneMap service. The required OneMap attribution is visible in the map view.
- Expo EAS Update: the app checks Expo's update service for JavaScript and asset updates.
- Expo EAS Insights: the app sends anonymous app-launch telemetry (platform, app version, and a random installation token) to help understand overall usage. It does not send location, followed markets, or interaction data.
There is no application backend, authentication service, payment processor, advertising SDK, or AI service.

REGIONAL AVAILABILITY
The app is designed for Singapore and its market dataset contains Singapore locations only. The interface supports English and Simplified Chinese. Apart from this intentional data coverage and language choice, the app functions consistently across regions.

REGULATED INDUSTRY AND THIRD-PARTY MATERIAL
PasarGuru does not operate in a regulated industry. It is not affiliated with the Singapore Government, NEA, or SLA. The app links to the public data.gov.sg source and displays the required OneMap attribution; no private or protected third-party credentials are needed.

PRIVACY AND SUPPORT
Privacy policy: https://sfdye.github.io/pasarguru/privacy
Support: https://github.com/sfdye/pasarguru/issues
