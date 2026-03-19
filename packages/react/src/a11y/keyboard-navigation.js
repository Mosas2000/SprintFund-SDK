"use strict";
/**
 * Keyboard Navigation Utilities
 *
 * Helpers for keyboard navigation patterns.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyboardNavigator = void 0;
exports.createKeyboardNavigator = createKeyboardNavigator;
var KeyboardNavigator = /** @class */ (function () {
    function KeyboardNavigator(config) {
        if (config === void 0) { config = {}; }
        var _a, _b, _c, _d;
        this.currentIndex = 0;
        this.items = [];
        this.config = {
            vertical: (_a = config.vertical) !== null && _a !== void 0 ? _a : true,
            horizontal: (_b = config.horizontal) !== null && _b !== void 0 ? _b : false,
            homeEnd: (_c = config.homeEnd) !== null && _c !== void 0 ? _c : true,
            wrap: (_d = config.wrap) !== null && _d !== void 0 ? _d : true
        };
    }
    /**
     * Set items for navigation
     */
    KeyboardNavigator.prototype.setItems = function (items) {
        this.items = items;
        this.currentIndex = 0;
    };
    /**
     * Handle keyboard event
     */
    KeyboardNavigator.prototype.handleKeyDown = function (event) {
        var handled = false;
        switch (event.key) {
            case 'ArrowUp':
                if (this.config.vertical) {
                    this.movePrevious();
                    handled = true;
                }
                break;
            case 'ArrowDown':
                if (this.config.vertical) {
                    this.moveNext();
                    handled = true;
                }
                break;
            case 'ArrowLeft':
                if (this.config.horizontal) {
                    this.movePrevious();
                    handled = true;
                }
                break;
            case 'ArrowRight':
                if (this.config.horizontal) {
                    this.moveNext();
                    handled = true;
                }
                break;
            case 'Home':
                if (this.config.homeEnd) {
                    this.moveToFirst();
                    handled = true;
                }
                break;
            case 'End':
                if (this.config.homeEnd) {
                    this.moveToLast();
                    handled = true;
                }
                break;
        }
        if (handled) {
            event.preventDefault();
            this.focusCurrentItem();
        }
        return handled;
    };
    /**
     * Move to next item
     */
    KeyboardNavigator.prototype.moveNext = function () {
        var nextIndex = this.currentIndex + 1;
        if (nextIndex >= this.items.length) {
            this.currentIndex = this.config.wrap ? 0 : this.items.length - 1;
        }
        else {
            this.currentIndex = nextIndex;
        }
    };
    /**
     * Move to previous item
     */
    KeyboardNavigator.prototype.movePrevious = function () {
        var prevIndex = this.currentIndex - 1;
        if (prevIndex < 0) {
            this.currentIndex = this.config.wrap ? this.items.length - 1 : 0;
        }
        else {
            this.currentIndex = prevIndex;
        }
    };
    /**
     * Move to first item
     */
    KeyboardNavigator.prototype.moveToFirst = function () {
        this.currentIndex = 0;
    };
    /**
     * Move to last item
     */
    KeyboardNavigator.prototype.moveToLast = function () {
        this.currentIndex = Math.max(0, this.items.length - 1);
        if (this.items.length === 0) {
            this.currentIndex = 0;
        }
    };
    /**
     * Focus current item
     */
    KeyboardNavigator.prototype.focusCurrentItem = function () {
        if (this.items[this.currentIndex]) {
            this.items[this.currentIndex].focus();
        }
    };
    /**
     * Get current item
     */
    KeyboardNavigator.prototype.getCurrentItem = function () {
        return this.items[this.currentIndex];
    };
    /**
     * Get current index
     */
    KeyboardNavigator.prototype.getCurrentIndex = function () {
        return this.currentIndex;
    };
    /**
     * Set current index
     */
    KeyboardNavigator.prototype.setCurrentIndex = function (index) {
        if (index >= 0 && index < this.items.length) {
            this.currentIndex = index;
        }
    };
    return KeyboardNavigator;
}());
exports.KeyboardNavigator = KeyboardNavigator;
/**
 * Create a keyboard navigator
 */
function createKeyboardNavigator(config) {
    return new KeyboardNavigator(config);
}
