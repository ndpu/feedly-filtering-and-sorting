var ext = {
  plusIconLink: "",
  eraseIconLink: "",
  closeIconLink: "",
  moveUpIconLink: "",
  moveDownIconLink: "",

  defaultUrlPrefixPattern: "https?://[^/]+/i/",
  subscriptionUrlPrefixPattern: "https?://[^/]+/i/feed/content",
  categoryUrlPrefixPattern: "https?://[^/]+/i/collection/content/user/[^/]+/",

  settingsBtnSuccessorSelector: ".button-customize-page",
  articlesContainerSelector: ".list-entries",
  articlesChunkSelector: ".EntryList__chunk",
  containerArticleSelector: " [data-entryid][data-title]:not([gap-article])",
  articleSelector:
    ".list-entries [data-entryid][data-title]:not([gap-article])",
  unreadArticlesCountSelector:
    ".list-entries .entry.unread:not([gap-article]), .list-entries .unread.u100",
  uncheckedArticlesSelector:
    ".list-entries [data-entryid][data-title]:not([checked-FFnS])",
  readArticleClass: "read",
  articleViewClass: "u100Entry",
  articleViewEntryContainerSelector: ".u100",
  loadingMessageSelector: ".list-entries .message.loading",
  sectionSelector: "#timeline > .section",
  publishAgeSpanSelector: ".ago, .metadata [title^=published]",
  publishAgeTimestampAttr: "title",
  articleSourceSelector: ".source, .sourceTitle",
  subscriptionChangeSelector: "header .heading",
  articleTitleAttribute: "data-title",
  articleEntryIdAttribute: "data-entryid",
  popularitySelector: ".EntryEngagement, .engagement, .nbrRecommendations",
  hidingInfoSibling: "header .right-col, header > h1 .button-dropdown",
  endOfFeedSelector: ".list-entries h4:contains(End of feed)",

  keepArticlesUnreadId: "keepArticlesUnread",
  articlesToMarkAsReadId: "articlesToMarkAsRead",
  sortedVisibleArticlesId: "sortedVisibleArticles",
  openAndMarkAsReadId: "isOpenAndMarkAsRead",
  openAndMarkAsReadClass: "open-in-new-tab-button",
  visualOpenAndMarkAsReadId: "isVisualOpenAndMarkAsRead",
  titleOpenAndMarkAsReadId: "isTitleOpenAndMarkAsRead",
  markAsReadAboveBelowId: "isMarkAsReadAboveBelowId",
  markAsReadAboveBelowClass: "mark-as-read-above-below-button",
  entryInfosJsonClass: "entryInfosJson",
  hideWhenMarkAboveBelowId: "isHideWhenMarkAboveBelow",
  hideAfterReadId: "isHideAfterRead",
  autoLoadAllArticlesId: "autoLoadAllArticles",
  batchSizeId: "batchSize",
  loadByBatchEnabledId: "loadByBatchEnabled",
  isNewestFirstId: "isNewestFirst",
  markAsReadAboveBelowReadId: "MarkAsReadAboveBelowRead",
  sortArticlesId: "isSortArticles",
  markAsReadImmediatelyClass: "FFnS-mark-as-read",
  buttonsContainerId: "FFnS-buttons-container",
  containerButtonClass: "FFnS-UI-button",
  openCurrentFeedArticlesId: "isOpenCurrentFeedArticles",
  openCurrentFeedArticlesClass: "open-current-articles-in-new-tab-button",
  disableAllFiltersButtonId: "isDisableAllFiltersButton",
  disableAllFiltersEnabled: "isDisableAllFiltersEnabled",
  disableAllFiltersButtonClass: "disable-all-filters-button",
  openCurrentFeedArticlesUnreadOnlyId: "openCurrentFeedArticlesUnreadOnly",
  markAsReadOnOpenCurrentFeedArticlesId:
    "isMarkAsReadOnOpenCurrentFeedArticles",
  maxOpenCurrentFeedArticlesId: "maxOpenCurrentFeedArticles"
};
