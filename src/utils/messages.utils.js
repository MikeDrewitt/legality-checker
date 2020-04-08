

/**
 * Class to contain an array of messages
 */
class Messages {
    constructor() {
        this.data = [];
    }

    /**
     * Used in place of Array.push to cut down on duplicate code.
     *
     * @param {String} message
     * @param {Object} card
     */
    push(message, card = null) {
        if (card) this.data.push(`${message} - ${card.name}`);
        else this.data.push(message);
    }

    /**
     * Concats the array of messages
     *
     * @param {Array<String>} updates
     */
    concat(updates) {
        this.data = [ ...this.data, ...updates ];
    }
}

module.exports = Messages;
