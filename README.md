# Feedly filtering and sorting

When this extension/script is enabled, a filter icon will appear next to the settings icon that toggles the filtering and sorting menu.

![Toggle button](https://raw.githubusercontent.com/soufianesakhi/feedly-filtering-and-sorting/master/screenshots/toggle%20button.PNG)

![Menu](https://raw.githubusercontent.com/soufianesakhi/feedly-filtering-and-sorting/master/screenshots/menu.PNG)

![Keyword settings](https://raw.githubusercontent.com/soufianesakhi/feedly-filtering-and-sorting/master/screenshots/keyword_controls.PNG)

![UI settings](https://raw.githubusercontent.com/soufianesakhi/feedly-filtering-and-sorting/master/screenshots/ui_controls.PNG)

![Advanced settings](https://raw.githubusercontent.com/soufianesakhi/feedly-filtering-and-sorting/master/screenshots/menu_advanced.PNG)

![Import settings](https://raw.githubusercontent.com/soufianesakhi/feedly-filtering-and-sorting/master/screenshots/settings_controls.PNG)

## Features

- Multi level sorting: by popularity, by title, by source or by publish date.
- Filtering: Hide the articles that contain at least one of the filtering keywords or by reading time.
- Restricting: Show only articles that contain at least one of the restricting keywords.
- Duplicates checking: Hide, highlight with a color and/or mark as read
- Advanced keyword matching: Specify areas to search, searching method (simple, pattern (RegExp), ...)
- Auto load all unread articles at once or by batches (mark as read by batch when there are a lot of unread articles).
- Advanced controls (keep recently published articles unread, ...).
- Pin hot articles to top.
- Import/export all settings from/to file.
- Advanced settings management (Import from / link to an other subscription, sync the settings across all the browser instances).
- Tweak the page (Add buttons to open articles in a new tab, mark as read/unread, ...).
- Add coloring rules to highlight titles.
- Auto refresh articles periodically.

Two settings configurations are available:

- Global settings: same configuration used for all subscriptions and categories.
- Subscription settings:
  - Subscription and category specific configurations
  - The default settings values are the global settings.
  - A group of subscriptions can share the same configuration by linking them to the same subscription.

## Requirements

### Feedly settings
![Feedly settings](https://raw.githubusercontent.com/soufianesakhi/feedly-filtering-and-sorting/master/screenshots/feedly_settings.PNG)

- The `Unread Only` option is required to be checked
- Sorting should be set to either `Latest` or `Oldest`

## [Changelog](https://github.com/soufianesakhi/feedly-filtering-and-sorting/releases)

## Requests

Please report bugs and feature requests by emailing me at soufiane.sakhi.js@gmail.com.

## Installation

Two options are available:

### Install as an extension

- Google Chrome: https://chrome.google.com/webstore/detail/feedly-filtering-and-sort/anknmaofbemimfabppdffklbfiecikgo

- Firefox: https://addons.mozilla.org/en-US/firefox/addon/feedly_filtering_and_sorting/

### Install as a user script

This script relies on the user scripts extensions like [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) or [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en).

After installing the appropriate user scripts extension, you can install the script from the following sites:

- https://greasyfork.org/en/scripts/20483-feedly-filtering-and-sorting
- https://openuserjs.org/scripts/soufianesakhi/Feedly_filtering_and_sorting
