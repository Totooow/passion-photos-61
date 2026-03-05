/**
 * @typedef {Object} Photo
 * @property {string} id
 * @property {string} title
 * @property {string} src
 * @property {string} folder
 * @property {Object<string, number>} prices
 */

/**
 * @typedef {Object} Folder
 * @property {string} id
 * @property {string} name
 */

/**
 * @typedef {Object} Format
 * @property {string} id
 * @property {string} label
 * @property {string} type - 'print' | 'digital'
 */

/**
 * @typedef {Object} CartItem
 * @property {string} key
 * @property {string} id
 * @property {string} title
 * @property {string} src
 * @property {string} formatId
 * @property {string} formatLabel
 * @property {string} formatType - 'print' | 'digital'
 * @property {number} price
 * @property {number} qty
 */

export {}
