"use strict";
/**
 * Focus Management for Accessible Components
 *
 * Handles focus state management for modals, dialogs, and complex components.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FocusManager = void 0;
exports.createFocusManager = createFocusManager;
var FocusManager = /** @class */ (function () {
    function FocusManager(config) {
        if (config === void 0) { config = {}; }
        var _a, _b;
        this.previousActiveElement = null;
        this.focusableSelectors = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
        this.config = {
            trap: (_a = config.trap) !== null && _a !== void 0 ? _a : false,
            restoreFocus: (_b = config.restoreFocus) !== null && _b !== void 0 ? _b : true,
            initialFocus: config.initialFocus || ''
        };
    }
    /**
     * Activate focus management on container
     */
    FocusManager.prototype.activate = function (container) {
        // Store current focus
        this.previousActiveElement =
            document.activeElement instanceof HTMLElement ? document.activeElement : null;
        // Set initial focus
        if (this.config.initialFocus) {
            var initial = container.querySelector(this.config.initialFocus);
            if (initial) {
                initial.focus();
                return;
            }
        }
        // Focus first focusable element
        var firstFocusable = container.querySelector(this.focusableSelectors);
        if (firstFocusable) {
            firstFocusable.focus();
        }
        else {
            container.focus();
        }
    };
    /**
     * Trap focus within container
     */
    FocusManager.prototype.trapFocus = function (event, container) {
        if (event.key !== 'Tab')
            return;
        var focusableElements = Array.from(container.querySelectorAll(this.focusableSelectors));
        if (focusableElements.length === 0)
            return;
        var firstElement = focusableElements[0];
        var lastElement = focusableElements[focusableElements.length - 1];
        var activeElement = document.activeElement;
        if (event.shiftKey) {
            // Shift+Tab
            if (activeElement === firstElement) {
                event.preventDefault();
                if (lastElement)
                    lastElement.focus();
            }
        }
        else {
            // Tab
            if (activeElement === lastElement) {
                event.preventDefault();
                if (firstElement)
                    firstElement.focus();
            }
        }
    };
    /**
     * Restore previous focus
     */
    FocusManager.prototype.restore = function () {
        if (this.config.restoreFocus && this.previousActiveElement) {
            this.previousActiveElement.focus();
        }
    };
    /**
     * Get focusable elements
     */
    FocusManager.prototype.getFocusableElements = function (container) {
        return Array.from(container.querySelectorAll(this.focusableSelectors));
    };
    /**
     * Set custom focusable selector
     */
    FocusManager.prototype.setFocusableSelector = function (selector) {
        this.focusableSelectors = selector;
    };
    return FocusManager;
}());
exports.FocusManager = FocusManager;
/**
 * Create a focus manager
 */
function createFocusManager(config) {
    return new FocusManager(config);
}
