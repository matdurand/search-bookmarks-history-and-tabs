import { mergeDeep } from "../helper/utils.js"

/**
 * The default options
 *
 * They can be selectively overwritten and customized via user options
 * @see https://github.com/Fannon/search-tabs-bookmarks-and-history#user-configuration
 */
export const defaultOptions = {
  general: {
    /** Extract tags from title and display it as a badge with different search priority */
    tags: true,
    /** Highlight search matches in results. Reduces rendering performance a little. */
    highlight: true,
    /** Display last visit */
    lastVisit: true,
    /** Display visit count */
    visitCounter: false,
    /** Display search result score */
    score: true,
  },

  search: {
    /**
     * Search approach to use. Choose between:
     *
     * * 'fuzzy'   : Default choice that allows for fuzzy (approximate) search.
     *               It is faster to index / start up, but may be slower when searching.
     *               It supports all options.
     *               Uses the https://fusejs.io/ library
     *
     * * 'precise' : Alternative search approach that is more precise.
     *               It may be slower to index / start up, but faster for searching.
     *               The 'fuzzyness' option will be ignored
     *               Uses the https://github.com/nextapps-de/flexsearch library
     */
    approach: "fuzzy", // 'precise' or 'fuzzy'
    /**
     * Max search results. Reduce for better performance.
     * Does not apply for tag and folder search
     */
    maxResults: 50,
    /** Min search string characters to have a match */
    minMatchCharLength: 2,
    /**
     * Fuzzy search threshold (0 - 1)
     * 0 is no fuzzyness, 1 is full fuzzyness
     */
    fuzzyness: 0.4,
  },

  tabs: {
    /** Whether to index and search for open tabs */
    enabled: true,
  },

  bookmarks: {
    /** Whether to index and search for bookmarks */
    enabled: true,
  },

  history: {
    /**
     * Whether to index and search for browsing history
     * Please note that the history API tends to be slow,
     * so be careful about how many items you load.
     */
    enabled: true,
    /** How many days ago the history should be fetched */
    daysAgo: 3,
    /** How many history items should be fetched at most */
    maxItems: 512,
  },

  /**
   * As a fallback, use search machines to find results
   */
  searchEngines: {
    /** Enable or disable search engine links in results */
    enabled: true,
    /**
     * For each entry here, one result will be created - in the order they are defined.
     * The URLs need to include the search querystring (see examples).
     */
    choices: [
      {
        name: "Google",
        urlPrefix: "https://www.google.com/search?q=",
      },
      {
        name: "Bing",
        urlPrefix: "https://www.bing.com/search?q=",
      },
      {
        name: "DuckDuckGo",
        urlPrefix: "https://duckduckgo.com/?q=",
      },
      {
        name: "dict.cc",
        urlPrefix: "https://www.dict.cc/?s=",
      },
    ],
  },

  /**
   * Options for the score calculation
   */
  score: {
    /** Filter out all search results below this minimum score */
    minScore: 30,

    /**
     * Minimum ratio of search term matchs to consider a match.
     * Set to 1 to only return results that match all search terms
     * Set to 0 to return all results that match at least one search term, allthough with reduced score
     *
     * This setting only applies to precise search
     */
    minSearchTermMatchRatio: 0.6,

    // RESULT TYPE BASE SCORES
    // Depending on the type of result, they start with a base score
    // Please make sure that this is not below the minScore :)

    /** Base score for bookmark results */
    bookmarkBaseScore: 100,
    /** Base score for tab results */
    tabBaseScore: 90,
    /** Base score for history results */
    historyBaseScore: 50,
    /** Base score for search engine entries */
    searchEngineBaseScore: 30,

    // FIELD WEIGHTS
    // Depending on in which field the search match was found,
    // the match gets a multiplier applied on how important the match is.

    /** Weight for a title match*/
    titleWeight: 1,
    /** Weight for a tag match*/
    tagWeight: 0.7,
    /** Weight for an url match*/
    urlWeight: 0.6,
    /** Weight for a folder match*/
    folderWeight: 0.5,

    // BONUS SCORES
    // If certain conditions apply, extra score points can be added

    /**
     * For each exact "includes" match we add some bonus points
     */
    exactIncludesBonus: 5,
    /**
     * Additional score points if title or url starts exactly with the search text.
     * This comes on top of an include bonus.
     */
    exactStartsWithBonus: 10,
    /**
     * Additional score points if title matches excactly with the search text.
     * This comes on top of an include and starts with bonus.
     */
    exactEqualsBonus: 10,
    /**
     * Additional points for an exact match of a search term tag (including #)
     */
    exactTagMatchBonus: 10,
    /**
     * Additional points for an exact match of a search term folder name (including ~)
     */
    exactFolderMatchBonus: 5,

    /**
     * Adds score points for every site visit according to browsing history
     * Please note that this is not only within `history.daysAgo`, but you whole history.
     */
    visitedBonusScore: 2,
    /** Maximum score points for visited bonus */
    visitedBonusScoreMaximum: 30,
  },
}

/**
 * Writes user settings to the google chrome sync storage
 *
 * @see https://developer.chrome.com/docs/extensions/reference/storage/
 */
export async function setUserOptions(userOptions) {
  return new Promise((resolve, reject) => {
    if (chrome && chrome.storage) {
      chrome.storage.sync.set({ userOptions: userOptions }, () => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError)
        }
        return resolve()
      })
    } else {
      console.warn("No chrome storage API found. Falling back to local Web Storage")
      window.localStorage.setItem("userOptions", JSON.stringify(userOptions))
      return resolve()
    }
  })
}

/**
 * Get user options.
 * If none are stored yet, this will return the default empty options
 */
export async function getUserOptions() {
  return new Promise((resolve, reject) => {
    if (chrome && chrome.storage) {
      chrome.storage.sync.get(["userOptions"], (result) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError)
        }
        return resolve(result.userOptions || {})
      })
    } else {
      console.warn("No chrome storage API found. Falling back to local Web Storage")
      const userOptions = window.localStorage.getItem("userOptions")
      return resolve(userOptions ? JSON.parse(userOptions) : {})
    }
  })
}

/**
 * Gets the actual effective options based on the default options
 * and the overrides of the user options
 */
export async function getEffectiveOptions() {
  const userOptions = await getUserOptions()
  return mergeDeep(defaultOptions, userOptions)
}