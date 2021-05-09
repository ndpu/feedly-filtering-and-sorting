/// <reference path="./_references.d.ts" />

import { ColoringRuleSource, FilteringType, SortingType } from "./DataTypes";
import { DuplicateChecker } from "./DuplicatesManager";
import { FeedlyPage } from "./FeedlyPage";
import { KeywordManager } from "./KeywordManager";
import { SettingsManager } from "./SettingsManager";
import { Subscription } from "./Subscription";
import { hexToRgb, isLight, removeContent, shadeColor } from "./Utils";

export class ArticleManager {
  settingsManager: SettingsManager;
  articleSorterFactory: ArticleSorterFactory;
  keywordManager: KeywordManager;
  page: FeedlyPage;
  articlesToMarkAsRead: Article[] = [];
  duplicateChecker: DuplicateChecker;
  darkMode = this.isDarkMode();

  constructor(
    settingsManager: SettingsManager,
    keywordManager: KeywordManager,
    page: FeedlyPage
  ) {
    this.settingsManager = settingsManager;
    this.keywordManager = keywordManager;
    this.articleSorterFactory = new ArticleSorterFactory();
    this.page = page;
    this.duplicateChecker = new DuplicateChecker(this);
  }

  refreshArticles() {
    this.resetArticles();
    if ($(ext.articleSelector).length == 0) {
      return;
    }
    $(ext.articleSelector).each((i, e) => {
      this.addArticle(e, true);
    });
    this.checkLastAddedArticle(true);
    this.sortArticles(true);
  }

  resetArticles() {
    this.articlesToMarkAsRead = [];
    this.duplicateChecker.reset();
  }

  refreshColoring() {
    this.darkMode = this.isDarkMode();
    $(ext.articleSelector).each((i, e) => {
      this.applyColoringRules(new Article(e));
    });
  }

  getCurrentSub(): Subscription {
    return this.settingsManager.getCurrentSubscription();
  }

  addArticle(a: Element, skipCheck?: boolean) {
    var article = new Article(a);
    this.filterAndRestrict(article);
    this.advancedControls(article);
    this.applyColoringRules(article);
    if (!skipCheck) {
      article.checked();
      this.checkLastAddedArticle();
      this.sortArticles();
    }
  }

  filterAndRestrict(article: Article) {
    var sub = this.getCurrentSub();
    if (sub.isFilteringEnabled() || sub.isRestrictingEnabled()) {
      var hide = false;
      if (sub.isRestrictingEnabled()) {
        hide = this.keywordManager.matchKeywords(
          article,
          sub,
          FilteringType.RestrictedOn,
          true
        );
      }
      if (sub.isFilteringEnabled()) {
        let filtered = this.keywordManager.matchKeywords(
          article,
          sub,
          FilteringType.FilteredOut
        );
        hide = hide || filtered;
        if (filtered && sub.isMarkAsReadFiltered()) {
          article.addClass(ext.markAsReadImmediatelyClass);
        }
      }
      if (hide) {
        article.setVisible(false);
      } else {
        article.setVisible();
      }
    } else {
      article.setVisible();
    }
  }

  advancedControls(article: Article) {
    var sub = this.getCurrentSub();
    var advControls = sub.getAdvancedControlsReceivedPeriod();
    if (advControls.keepUnread || advControls.hide) {
      try {
        var threshold = Date.now() - advControls.maxHours * 3600 * 1000;
        var receivedAge = article.getReceivedAge();
        if (receivedAge <= threshold) {
          if (advControls.keepUnread) {
            this.articlesToMarkAsRead.push(article);
          }
        } else {
          if (
            advControls.showIfHot &&
            (article.isHot() ||
              article.getPopularity() >= advControls.minPopularity)
          ) {
            if (advControls.keepUnread && advControls.markAsReadVisible) {
              this.articlesToMarkAsRead.push(article);
            }
          } else if (advControls.hide) {
            article.setVisible(false);
          }
        }
      } catch (err) {
        console.log(err);
      }
    }

    this.duplicateChecker.check(article);

    const filteringByReadingTime = sub.getFilteringByReadingTime();
    if (filteringByReadingTime.enabled) {
      let thresholdWords =
        filteringByReadingTime.thresholdMinutes *
        filteringByReadingTime.wordsPerMinute;
      let articleWords = article.body.split(" ").length;
      if (
        articleWords != thresholdWords &&
        filteringByReadingTime.filterLong == articleWords > thresholdWords
      ) {
        article.setVisible(false);
      } else if (filteringByReadingTime.keepUnread) {
        this.articlesToMarkAsRead.push(article);
      }
    }
  }

  checkPopularityAndSort() {
    let sorted = true;

    $(ext.articlesContainerSelector).each((i, articlesContainer) => {
      const popularityArr = [];
      const hotPopularityArr = [];
      $(articlesContainer)
        .find(ext.articleSelector + ":visible")
        .each((i, article) => {
          let engagement = $(article).find(ext.popularitySelector);
          const popularity = parsePopularity($(engagement).text());
          if ($(engagement).is(".EntryEngagement--hot, .hot, .onfire")) {
            hotPopularityArr.push(popularity);
          } else {
            popularityArr.push(popularity);
          }
        });
      sorted = sorted && this.checkPopularitySorted(hotPopularityArr);
      sorted = sorted && this.checkPopularitySorted(popularityArr);
    });
    if (!sorted) {
      console.log(`Sorting by popularity after check`);
      this.sortArticles(true);
    }
  }

  private checkPopularitySorted(popularityArr: number[]) {
    let sorted = true;
    const sortedCheck =
      this.getCurrentSub().getSortingType() == SortingType.PopularityDesc
        ? (i: number) => {
            return popularityArr[i] >= popularityArr[i + 1];
          }
        : (i: number) => {
            return popularityArr[i] <= popularityArr[i + 1];
          };
    for (var i = 0; i < popularityArr.length - 1 && sorted; i++) {
      sorted = sortedCheck(i);
    }
    return sorted;
  }

  checkDisableAllFilters() {
    if (this.page.get(ext.disableAllFiltersButtonId)) {
      if (this.page.get(ext.disableAllFiltersEnabled, true)) {
        $(ext.articleSelector).css("display", "");
        this.page.clearHidingInfo();
      }
    }
  }

  applyColoringRules(article: Article) {
    let sub = this.getCurrentSub();
    let rules = sub.getColoringRules();
    for (let i = 0; i < rules.length; i++) {
      let rule = rules[i];
      let keywords: string[];
      switch (rule.source) {
        case ColoringRuleSource.SpecificKeywords:
          keywords = rule.specificKeywords;
          break;
        case ColoringRuleSource.RestrictingKeywords:
          keywords = sub.getFilteringList(FilteringType.RestrictedOn);
          break;
        case ColoringRuleSource.FilteringKeywords:
          keywords = sub.getFilteringList(FilteringType.FilteredOut);
          break;
      }
      if (rule.source == ColoringRuleSource.SourceTitle) {
        article.setColor(this.generateColor(article.getSource()));
      } else {
        let match = this.keywordManager.matchSpecficKeywords(
          article,
          keywords,
          rule.matchingMethod,
          rule.matchingArea
        );
        article.setColor(match ? this.correctDarkness("#" + rule.color) : "");
        if (match) {
          return;
        }
      }
    }
  }

  correctDarkness(hexColor: string) {
    const rgb = hexToRgb(hexColor);
    if (isLight(rgb) && this.darkMode) {
      return shadeColor(rgb, -80);
    }
    return hexColor;
  }

  generateColor(id: string): string {
    if (!id || id.length == 0) {
      return "";
    }
    var x = 0;
    for (var i = 0; i < id.length; i++) {
      x += id.charCodeAt(i);
    }
    let h = (x % 360) + 1;
    return "hsl(" + h + ", 100%, " + (this.darkMode ? "20%)" : "80%)");
  }

  isDarkMode(): boolean {
    return $("body").hasClass("theme--dark");
  }

  checkLastAddedArticle(refresh?: boolean) {
    const allArticlesChecked =
      $(ext.articleSelector + ext.uncheckedArticlesSelector).length == 0;
    if (allArticlesChecked) {
      this.prepareMarkAsRead();
      this.page.refreshHidingInfo();
      if (!refresh) {
        this.duplicateChecker.allArticlesChecked();
      }
      this.checkDisableAllFilters();
    }
  }

  sortArticles(force?: boolean) {
    if (!this.page.get(ext.sortArticlesId) && !force) {
      return;
    }
    this.page.put(ext.sortArticlesId, false);
    let sub = this.getCurrentSub();
    let endOfFeed: JQuery;
    let sortedVisibleEntryIds: string[] = [];
    $(ext.articlesContainerSelector).each((i, c) => {
      let visibleArticles: Article[] = [];
      let hiddenArticles: Article[] = [];
      let articlesContainer = $(c);
      articlesContainer.find(ext.articleSelector).each((i, e) => {
        let a = new Article(e);
        if (a.isVisible()) {
          visibleArticles.push(a);
        } else {
          hiddenArticles.push(a);
        }
      });
      if (sub.isPinHotToTop()) {
        var hotArticles: Article[] = [];
        var normalArticles: Article[] = [];
        visibleArticles.forEach((article) => {
          if (article.isHot()) {
            hotArticles.push(article);
          } else {
            normalArticles.push(article);
          }
        });
        this.sortArticleArray(hotArticles);
        this.sortArticleArray(normalArticles);
        visibleArticles = hotArticles.concat(normalArticles);
      } else {
        this.sortArticleArray(visibleArticles);
      }

      if (sub.isSortingEnabled() || sub.isPinHotToTop()) {
        console.log("Sorting articles at " + new Date().toTimeString());
        endOfFeed || (endOfFeed = $(ext.endOfFeedSelector).detach());
        let chunks = articlesContainer.find(ext.articlesChunkSelector);
        removeContent(chunks.find(".Heading"));
        let containerChunk = chunks.first();
        containerChunk.empty();
        let appendArticle = (article: Article) => {
          const container = article.getContainer();
          container.detach().appendTo(containerChunk);
        };
        visibleArticles.forEach(appendArticle);
        hiddenArticles.forEach(appendArticle);
      }
      sortedVisibleEntryIds.push(...visibleArticles.map((a) => a.getEntryId()));
    });

    let lastContainer = $(ext.articlesContainerSelector).last();
    if (endOfFeed.length > 0) {
      lastContainer.append(endOfFeed);
    } else {
      $(ext.endOfFeedSelector).detach().appendTo(lastContainer);
    }
    this.page.put(ext.sortedVisibleArticlesId, sortedVisibleEntryIds);
  }

  prepareMarkAsRead() {
    if (this.articlesToMarkAsRead.length > 0) {
      var ids = this.articlesToMarkAsRead.map<string>((article) => {
        return article.getEntryId();
      });
      this.page.put(ext.articlesToMarkAsReadId, ids);
    }
  }

  sortArticleArray(articles: Article[]) {
    var sub = this.getCurrentSub();
    if (!sub.isSortingEnabled()) {
      return;
    }
    let st = sub.getSortingType();
    var sortingTypes = [st].concat(sub.getAdditionalSortingTypes());
    articles.sort(this.articleSorterFactory.getSorter(sortingTypes));

    if (SortingType.SourceNewestReceiveDate == st) {
      let sourceToArticles: { [key: string]: Article[] } = {};
      articles.forEach((a) => {
        let sourceArticles =
          (sourceToArticles[a.getSource()] ||
            (sourceToArticles[a.getSource()] = []),
          sourceToArticles[a.getSource()]);
        sourceArticles.push(a);
      });
      articles.length = 0;
      for (let source in sourceToArticles) {
        articles.push(...sourceToArticles[source]);
      }
    }
  }

  isOldestFirst(): boolean {
    return !this.page.get(ext.isNewestFirstId, true);
  }
}

class ArticleSorterFactory {
  sorterByType: { [key: number]: (a: Article, b: Article) => number } = {};

  constructor() {
    function titleSorter(isAscending: boolean) {
      var multiplier = isAscending ? 1 : -1;
      return (a: Article, b: Article) => {
        return a.getTitle().localeCompare(b.getTitle()) * multiplier;
      };
    }
    function popularitySorter(isAscending: boolean) {
      var multiplier = isAscending ? 1 : -1;
      return (a: Article, b: Article) => {
        return (a.getPopularity() - b.getPopularity()) * multiplier;
      };
    }
    function receivedDateSorter(isNewFirst: boolean) {
      var multiplier = isNewFirst ? -1 : 1;
      return (a: Article, b: Article) => {
        return (a.getReceivedAge() - b.getReceivedAge()) * multiplier;
      };
    }
    function publishDateSorter(isNewFirst: boolean) {
      var multiplier = isNewFirst ? -1 : 1;
      return (a: Article, b: Article) => {
        return (a.getPublishAge() - b.getPublishAge()) * multiplier;
      };
    }
    function publishDaySorter(isNewFirst: boolean) {
      var multiplier = isNewFirst ? -1 : 1;
      return (a: Article, b: Article) => {
        let dateA = a.getPublishDate(),
          dateB = b.getPublishDate();
        let result = dateA.getFullYear() - dateB.getFullYear();
        if (result == 0) {
          result = dateA.getMonth() - dateB.getMonth();
          if (result == 0) {
            result = dateA.getDay() - dateB.getDay();
          }
        }
        return result * multiplier;
      };
    }
    function sourceSorter(isAscending: boolean) {
      var multiplier = isAscending ? 1 : -1;
      return (a: Article, b: Article) => {
        return a.getSource().localeCompare(b.getSource()) * multiplier;
      };
    }

    this.sorterByType[SortingType.TitleDesc] = titleSorter(false);
    this.sorterByType[SortingType.TitleAsc] = titleSorter(true);
    this.sorterByType[SortingType.PopularityDesc] = popularitySorter(false);
    this.sorterByType[SortingType.PopularityAsc] = popularitySorter(true);
    this.sorterByType[SortingType.ReceivedDateNewFirst] = receivedDateSorter(
      true
    );
    this.sorterByType[SortingType.ReceivedDateOldFirst] = receivedDateSorter(
      false
    );
    this.sorterByType[SortingType.PublishDateNewFirst] = publishDateSorter(
      true
    );
    this.sorterByType[SortingType.PublishDateOldFirst] = publishDateSorter(
      false
    );
    this.sorterByType[SortingType.PublishDayNewFirst] = publishDaySorter(true);
    this.sorterByType[SortingType.PublishDayOldFirst] = publishDaySorter(false);
    this.sorterByType[SortingType.SourceAsc] = sourceSorter(true);
    this.sorterByType[SortingType.SourceDesc] = sourceSorter(false);
    this.sorterByType[SortingType.SourceNewestReceiveDate] = receivedDateSorter(
      true
    );
    this.sorterByType[SortingType.Random] = () => {
      return Math.random() - 0.5;
    };
  }

  getSorter(sortingTypes: SortingType[]): (a: Article, b: Article) => number {
    if (sortingTypes.length == 1) {
      return this.sorterByType[sortingTypes[0]];
    }
    return (a: Article, b: Article) => {
      var res;
      for (var i = 0; i < sortingTypes.length; i++) {
        res = this.sorterByType[sortingTypes[i]](a, b);
        if (res != 0) {
          return res;
        }
      }
      return res;
    };
  }
}

export class EntryInfos {
  body: string;
  author: string;
  engagement: number;
  published: number;
  received: number;
  constructor(jsonInfos) {
    var bodyInfos = jsonInfos.content ? jsonInfos.content : jsonInfos.summary;
    this.body = bodyInfos ? bodyInfos.content : "";
    this.author = jsonInfos.author;
    this.engagement = jsonInfos.engagement;
    this.published = jsonInfos.published;
    this.received = jsonInfos.crawled;
  }
}

export class Article {
  private container: JQuery;
  private entryId: string;
  title: string;
  body: string;
  author: string;
  private source: string;
  private receivedAge: number;
  private publishAge: number;
  private popularity: number;
  private url: string;
  private entryInfos: EntryInfos;

  constructor(articleContainer: Element) {
    this.container = $(articleContainer);
    this.entryId = this.container.attr("id").replace(/_main$/, "");
    var infosElement = this.container.find("." + ext.entryInfosJsonClass);
    if (infosElement.length > 0) {
      this.entryInfos = JSON.parse(infosElement.text());
      if (this.entryInfos) {
        this.body = this.entryInfos.body;
        this.body = this.body ? this.body.toLowerCase() : "";
        this.author = this.entryInfos.author;
        this.author = this.author ? this.author.toLowerCase() : "";
        this.receivedAge = this.entryInfos.received;
        this.publishAge = this.entryInfos.published;
      } else {
        let isInlineView = this.container.find(ext.inlineViewClass).length > 0;
        this.body = this.container
          .find(isInlineView ? ".content" : ".summary")
          .text()
          .toLowerCase();
        this.author = this.container
          .find(".authors")
          .text()
          .replace("by", "")
          .trim()
          .toLowerCase();
        var ageStr = this.container
          .find(ext.publishAgeSpanSelector)
          .attr(ext.publishAgeTimestampAttr);
        var ageSplit = ageStr.split("--");
        var publishDate = ageSplit[0].replace(/[^:]*:/, "").trim();
        var receivedDate = ageSplit[1].replace(/[^:]*:/, "").trim();
        this.publishAge = Date.parse(publishDate);
        this.receivedAge = Date.parse(receivedDate);
      }
    }

    // Title
    this.title = this.container
      .find(ext.articleTitleSelector)
      .text()
      .trim()
      .toLowerCase();

    // Popularity
    this.popularity = parsePopularity(
      this.container.find(ext.popularitySelector).text()
    );

    // Source
    var source = this.container.find(ext.articleSourceSelector);
    if (source != null) {
      this.source = source.text().trim();
    }

    // URL
    this.url = this.container.find(ext.articleUrlAnchorSelector).attr("href");
  }

  addClass(c) {
    return this.container.addClass(c);
  }

  getTitle(): string {
    return this.title;
  }

  getUrl() {
    return this.url;
  }

  getSource(): string {
    return this.source;
  }

  getPopularity(): number {
    return this.popularity;
  }

  getReceivedAge(): number {
    return this.receivedAge;
  }

  getReceivedDate(): Date {
    return new Date(this.receivedAge);
  }

  getPublishAge(): number {
    return this.publishAge;
  }

  getPublishDate(): Date {
    return new Date(this.publishAge);
  }

  isHot(): boolean {
    var span = this.container.find(ext.popularitySelector);
    return (
      span.hasClass("hot") ||
      span.hasClass("onfire") ||
      span.hasClass("EntryEngagement--hot")
    );
  }

  getEntryId(): string {
    return this.entryId;
  }

  setVisible(visible?: boolean) {
    if (visible != null && !visible) {
      this.container.css("display", "none");
    } else {
      this.container.css("display", "");
    }
  }

  getContainer() {
    return this.container;
  }

  isVisible(): boolean {
    return !(this.container.css("display") === "none");
  }

  checked() {
    this.container.attr(ext.checkedArticlesAttribute, "");
  }

  setColor(color: string) {
    this.container.css("background-color", color);
  }
}

function parsePopularity(popularityStr: String) {
  popularityStr = popularityStr.trim().replace("+", "");
  if (popularityStr.indexOf("K") > -1) {
    popularityStr = popularityStr.replace("K", "");
    popularityStr += "000";
  }
  return Number(popularityStr);
}
