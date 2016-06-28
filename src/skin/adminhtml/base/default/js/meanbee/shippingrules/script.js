'use strict';
(function (modules) {
    var installedModules = {};
    function __webpack_require__(moduleId) {
        if (installedModules[moduleId])
            return installedModules[moduleId].exports;
        var module = installedModules[moduleId] = {
            exports: {},
            id: moduleId,
            loaded: false
        };
        modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        module.loaded = true;
        return module.exports;
    }
    __webpack_require__.m = modules;
    __webpack_require__.c = installedModules;
    __webpack_require__.p = '';
    return __webpack_require__(0);
}([
    function (module, exports, __webpack_require__) {
        __webpack_require__(1);
        __webpack_require__(3);
    },
    function (module, exports, __webpack_require__) {
        (function () {
            if (typeof HTMLElement.prototype.setAttributes !== 'function') {
                HTMLElement.prototype.setAttributes = function (attributes) {
                    return __webpack_require__(2)(element, attributes);
                };
            }
        }());
    },
    function (module, exports) {
        module.exports = function setAttributes(element, attributes) {
            var isPlainObject = Object.prototype.toString.call(attributes) === '[object Object]' && typeof attributes.constructor === 'function' && Object.prototype.toString.call(attributes.constructor.prototype) === '[object Object]' && attributes.constructor.prototype.hasOwnProperty('isPrototypeOf');
            if (isPlainObject) {
                for (var key in attributes) {
                    element.setAttribute(key, attributes[key]);
                }
            } else {
                throw new DOMException('Failed to execute \'setAttributes\' on \'Element\': ' + Object.prototype.toString.call(attributes) + ' is not a plain object.');
            }
        };
    },
    function (module, exports, __webpack_require__) {
        (function () {
            if (typeof HTMLElement.prototype.appendChildren !== 'function') {
                HTMLElement.prototype.appendChildren = function (children) {
                    return __webpack_require__(4)(this, children);
                };
            }
        }());
    },
    function (module, exports) {
        module.exports = function appendChildren(element, children) {
            children = Array.isArray(children) ? children : [children];
            children.forEach(function (child) {
                if (child instanceof HTMLElement) {
                    element.appendChild(child);
                } else if (child) {
                    element.appendChild(document.createTextNode(child.toString()));
                } else {
                    throw new DOMException('Failed to execute \'appendChildren\' on \'Element\': ' + Object.prototype.toString.call(child) + ' is not valid.');
                }
            });
        };
    }
]));
'use strict';
var _typeof = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? function (obj) {
    return typeof obj;
} : function (obj) {
    return obj && typeof Symbol === 'function' && obj.constructor === Symbol ? 'symbol' : typeof obj;
};
;
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Popper = factory();
    }
}(window, function () {
    'use strict';
    var root = window;
    var DEFAULTS = {
        placement: 'bottom',
        gpuAcceleration: true,
        offset: 0,
        boundariesElement: 'viewport',
        boundariesPadding: 5,
        preventOverflowOrder: [
            'left',
            'right',
            'top',
            'bottom'
        ],
        flipBehavior: 'flip',
        arrowElement: '[x-arrow]',
        modifiers: [
            'shift',
            'offset',
            'preventOverflow',
            'keepTogether',
            'arrow',
            'flip',
            'applyStyle'
        ],
        modifiersIgnored: []
    };
    function Popper(reference, popper, options) {
        this._reference = reference.jquery ? reference[0] : reference;
        this.state = {};
        var isNotDefined = typeof popper === 'undefined' || popper === null;
        var isConfig = popper && Object.prototype.toString.call(popper) === '[object Object]';
        if (isNotDefined || isConfig) {
            this._popper = this.parse(isConfig ? popper : {});
        } else {
            this._popper = popper.jquery ? popper[0] : popper;
        }
        this._options = Object.assign({}, DEFAULTS, options);
        this._options.modifiers = this._options.modifiers.map(function (modifier) {
            if (this._options.modifiersIgnored.indexOf(modifier) !== -1)
                return;
            if (modifier === 'applyStyle') {
                this._popper.setAttribute('x-placement', this._options.placement);
            }
            return this.modifiers[modifier] || modifier;
        }.bind(this));
        this.state.position = this._getPosition(this._popper, this._reference);
        setStyle(this._popper, { position: this.state.position });
        this.update();
        this._setupEventListeners();
        return this;
    }
    Popper.prototype.destroy = function () {
        this._popper.removeAttribute('x-placement');
        this._popper.style.left = '';
        this._popper.style.position = '';
        this._popper.style.top = '';
        this._popper.style[getSupportedPropertyName('transform')] = '';
        this._removeEventListeners();
        if (this._options.removeOnDestroy) {
            this._popper.remove();
        }
        return this;
    };
    Popper.prototype.update = function () {
        var data = {
            instance: this,
            styles: {}
        };
        data.placement = this._options.placement;
        data._originalPlacement = this._options.placement;
        data.offsets = this._getOffsets(this._popper, this._reference, data.placement);
        data.boundaries = this._getBoundaries(data, this._options.boundariesPadding, this._options.boundariesElement);
        data = this.runModifiers(data, this._options.modifiers);
        if (typeof this.state.updateCallback === 'function') {
            this.state.updateCallback(data);
        }
    };
    Popper.prototype.onCreate = function (callback) {
        callback(this);
        return this;
    };
    Popper.prototype.onUpdate = function (callback) {
        this.state.updateCallback = callback;
        return this;
    };
    Popper.prototype.parse = function (config) {
        var defaultConfig = {
            tagName: 'div',
            classNames: ['popper'],
            attributes: [],
            parent: root.document.body,
            content: '',
            contentType: 'text',
            arrowTagName: 'div',
            arrowClassNames: ['popper__arrow'],
            arrowAttributes: ['x-arrow']
        };
        config = Object.assign({}, defaultConfig, config);
        var d = root.document;
        var popper = d.createElement(config.tagName);
        addClassNames(popper, config.classNames);
        addAttributes(popper, config.attributes);
        if (config.contentType === 'node') {
            popper.appendChild(config.content.jquery ? config.content[0] : config.content);
        } else if (config.contentType === 'html') {
            popper.innerHTML = config.content;
        } else {
            popper.textContent = config.content;
        }
        if (config.arrowTagName) {
            var arrow = d.createElement(config.arrowTagName);
            addClassNames(arrow, config.arrowClassNames);
            addAttributes(arrow, config.arrowAttributes);
            popper.appendChild(arrow);
        }
        var parent = config.parent.jquery ? config.parent[0] : config.parent;
        if (typeof parent === 'string') {
            parent = d.querySelectorAll(config.parent);
            if (parent.length > 1) {
                console.warn('WARNING: the given `parent` query(' + config.parent + ') matched more than one element, the first one will be used');
            }
            if (parent.length === 0) {
                throw 'ERROR: the given `parent` doesn\'t exists!';
            }
            parent = parent[0];
        }
        if (parent.length > 1 && parent instanceof Element === false) {
            console.warn('WARNING: you have passed as parent a list of elements, the first one will be used');
            parent = parent[0];
        }
        parent.appendChild(popper);
        return popper;
        function addClassNames(element, classNames) {
            classNames.forEach(function (className) {
                element.classList.add(className);
            });
        }
        function addAttributes(element, attributes) {
            attributes.forEach(function (attribute) {
                element.setAttribute(attribute.split(':')[0], attribute.split(':')[1] || '');
            });
        }
    };
    Popper.prototype._getPosition = function (popper, reference) {
        var container = getOffsetParent(reference);
        var isParentFixed = isFixed(reference, container);
        return isParentFixed ? 'fixed' : 'absolute';
    };
    Popper.prototype._getOffsets = function (popper, reference, placement) {
        placement = placement.split('-')[0];
        var popperOffsets = {};
        popperOffsets.position = this.state.position;
        var isParentFixed = popperOffsets.position === 'fixed';
        var referenceOffsets = getOffsetRectRelativeToCustomParent(reference, getOffsetParent(popper), isParentFixed);
        var popperRect = getOuterSizes(popper);
        if ([
                'right',
                'left'
            ].indexOf(placement) !== -1) {
            popperOffsets.top = referenceOffsets.top + referenceOffsets.height / 2 - popperRect.height / 2;
            if (placement === 'left') {
                popperOffsets.left = referenceOffsets.left - popperRect.width;
            } else {
                popperOffsets.left = referenceOffsets.right;
            }
        } else {
            popperOffsets.left = referenceOffsets.left + referenceOffsets.width / 2 - popperRect.width / 2;
            if (placement === 'top') {
                popperOffsets.top = referenceOffsets.top - popperRect.height;
            } else {
                popperOffsets.top = referenceOffsets.bottom;
            }
        }
        popperOffsets.width = popperRect.width;
        popperOffsets.height = popperRect.height;
        return {
            popper: popperOffsets,
            reference: referenceOffsets
        };
    };
    Popper.prototype._setupEventListeners = function () {
        this.state.updateBound = this.update.bind(this);
        root.addEventListener('resize', this.state.updateBound);
        if (this._options.boundariesElement !== 'window') {
            var target = getScrollParent(this._reference);
            if (target === root.document.body || target === root.document.documentElement) {
                target = root;
            }
            target.addEventListener('scroll', this.state.updateBound);
        }
    };
    Popper.prototype._removeEventListeners = function () {
        root.removeEventListener('resize', this.state.updateBound);
        if (this._options.boundariesElement !== 'window') {
            var target = getScrollParent(this._reference);
            if (target === root.document.body || target === root.document.documentElement) {
                target = root;
            }
            target.removeEventListener('scroll', this.state.updateBound);
        }
        this.state.updateBound = null;
    };
    Popper.prototype._getBoundaries = function (data, padding, boundariesElement) {
        var boundaries = {};
        var width, height;
        if (boundariesElement === 'window') {
            var body = root.document.body, html = root.document.documentElement;
            height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
            width = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
            boundaries = {
                top: 0,
                right: width,
                bottom: height,
                left: 0
            };
        } else if (boundariesElement === 'viewport') {
            var offsetParent = getOffsetParent(this._popper);
            var scrollParent = getScrollParent(this._popper);
            var offsetParentRect = getOffsetRect(offsetParent);
            var scrollTop = data.offsets.popper.position === 'fixed' ? 0 : scrollParent.scrollTop;
            var scrollLeft = data.offsets.popper.position === 'fixed' ? 0 : scrollParent.scrollLeft;
            boundaries = {
                top: 0 - (offsetParentRect.top - scrollTop),
                right: root.document.documentElement.clientWidth - (offsetParentRect.left - scrollLeft),
                bottom: root.document.documentElement.clientHeight - (offsetParentRect.top - scrollTop),
                left: 0 - (offsetParentRect.left - scrollLeft)
            };
        } else {
            if (getOffsetParent(this._popper) === boundariesElement) {
                boundaries = {
                    top: 0,
                    left: 0,
                    right: boundariesElement.clientWidth,
                    bottom: boundariesElement.clientHeight
                };
            } else {
                boundaries = getOffsetRect(boundariesElement);
            }
        }
        boundaries.left += padding;
        boundaries.right -= padding;
        boundaries.top = boundaries.top + padding;
        boundaries.bottom = boundaries.bottom - padding;
        return boundaries;
    };
    Popper.prototype.runModifiers = function (data, modifiers, ends) {
        var modifiersToRun = modifiers.slice();
        if (ends !== undefined) {
            modifiersToRun = this._options.modifiers.slice(0, getArrayKeyIndex(this._options.modifiers, ends));
        }
        modifiersToRun.forEach(function (modifier) {
            if (isFunction(modifier)) {
                data = modifier.call(this, data);
            }
        }.bind(this));
        return data;
    };
    Popper.prototype.isModifierRequired = function (requesting, requested) {
        var index = getArrayKeyIndex(this._options.modifiers, requesting);
        return !!this._options.modifiers.slice(0, index).filter(function (modifier) {
            return modifier === requested;
        }).length;
    };
    Popper.prototype.modifiers = {};
    Popper.prototype.modifiers.applyStyle = function (data) {
        var styles = { position: data.offsets.popper.position };
        var left = Math.round(data.offsets.popper.left);
        var top = Math.round(data.offsets.popper.top);
        var prefixedProperty;
        if (this._options.gpuAcceleration && (prefixedProperty = getSupportedPropertyName('transform'))) {
            styles[prefixedProperty] = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
            styles.top = 0;
            styles.left = 0;
        } else {
            styles.left = left;
            styles.top = top;
        }
        Object.assign(styles, data.styles);
        setStyle(this._popper, styles);
        this._popper.setAttribute('x-placement', data.placement);
        if (this.isModifierRequired(this.modifiers.applyStyle, this.modifiers.arrow) && data.offsets.arrow) {
            setStyle(data.arrowElement, data.offsets.arrow);
        }
        return data;
    };
    Popper.prototype.modifiers.shift = function (data) {
        var placement = data.placement;
        var basePlacement = placement.split('-')[0];
        var shiftVariation = placement.split('-')[1];
        if (shiftVariation) {
            var reference = data.offsets.reference;
            var popper = getPopperClientRect(data.offsets.popper);
            var shiftOffsets = {
                y: {
                    start: { top: reference.top },
                    end: { top: reference.top + reference.height - popper.height }
                },
                x: {
                    start: { left: reference.left },
                    end: { left: reference.left + reference.width - popper.width }
                }
            };
            var axis = [
                'bottom',
                'top'
            ].indexOf(basePlacement) !== -1 ? 'x' : 'y';
            data.offsets.popper = Object.assign(popper, shiftOffsets[axis][shiftVariation]);
        }
        return data;
    };
    Popper.prototype.modifiers.preventOverflow = function (data) {
        var order = this._options.preventOverflowOrder;
        var popper = getPopperClientRect(data.offsets.popper);
        var check = {
            left: function left() {
                var left = popper.left;
                if (popper.left < data.boundaries.left) {
                    left = Math.max(popper.left, data.boundaries.left);
                }
                return { left: left };
            },
            right: function right() {
                var left = popper.left;
                if (popper.right > data.boundaries.right) {
                    left = Math.min(popper.left, data.boundaries.right - popper.width);
                }
                return { left: left };
            },
            top: function top() {
                var top = popper.top;
                if (popper.top < data.boundaries.top) {
                    top = Math.max(popper.top, data.boundaries.top);
                }
                return { top: top };
            },
            bottom: function bottom() {
                var top = popper.top;
                if (popper.bottom > data.boundaries.bottom) {
                    top = Math.min(popper.top, data.boundaries.bottom - popper.height);
                }
                return { top: top };
            }
        };
        order.forEach(function (direction) {
            data.offsets.popper = Object.assign(popper, check[direction]());
        });
        return data;
    };
    Popper.prototype.modifiers.keepTogether = function (data) {
        var popper = getPopperClientRect(data.offsets.popper);
        var reference = data.offsets.reference;
        var f = Math.floor;
        if (popper.right < f(reference.left)) {
            data.offsets.popper.left = f(reference.left) - popper.width;
        }
        if (popper.left > f(reference.right)) {
            data.offsets.popper.left = f(reference.right);
        }
        if (popper.bottom < f(reference.top)) {
            data.offsets.popper.top = f(reference.top) - popper.height;
        }
        if (popper.top > f(reference.bottom)) {
            data.offsets.popper.top = f(reference.bottom);
        }
        return data;
    };
    Popper.prototype.modifiers.flip = function (data) {
        if (!this.isModifierRequired(this.modifiers.flip, this.modifiers.preventOverflow)) {
            console.warn('WARNING: preventOverflow modifier is required by flip modifier in order to work, be sure to include it before flip!');
            return data;
        }
        if (data.flipped && data.placement === data._originalPlacement) {
            return data;
        }
        var placement = data.placement.split('-')[0];
        var placementOpposite = getOppositePlacement(placement);
        var variation = data.placement.split('-')[1] || '';
        var flipOrder = [];
        if (this._options.flipBehavior === 'flip') {
            flipOrder = [
                placement,
                placementOpposite
            ];
        } else {
            flipOrder = this._options.flipBehavior;
        }
        flipOrder.forEach(function (step, index) {
            if (placement !== step || flipOrder.length === index + 1) {
                return;
            }
            placement = data.placement.split('-')[0];
            placementOpposite = getOppositePlacement(placement);
            var popperOffsets = getPopperClientRect(data.offsets.popper);
            var a = [
                'right',
                'bottom'
            ].indexOf(placement) !== -1;
            if (a && Math.floor(data.offsets.reference[placement]) > Math.floor(popperOffsets[placementOpposite]) || !a && Math.floor(data.offsets.reference[placement]) < Math.floor(popperOffsets[placementOpposite])) {
                data.flipped = true;
                data.placement = flipOrder[index + 1];
                if (variation) {
                    data.placement += '-' + variation;
                }
                data.offsets.popper = this._getOffsets(this._popper, this._reference, data.placement).popper;
                data = this.runModifiers(data, this._options.modifiers, this._flip);
            }
        }.bind(this));
        return data;
    };
    Popper.prototype.modifiers.offset = function (data) {
        var offset = this._options.offset;
        var popper = data.offsets.popper;
        if (data.placement.indexOf('left') !== -1) {
            popper.top -= offset;
        } else if (data.placement.indexOf('right') !== -1) {
            popper.top += offset;
        } else if (data.placement.indexOf('top') !== -1) {
            popper.left -= offset;
        } else if (data.placement.indexOf('bottom') !== -1) {
            popper.left += offset;
        }
        return data;
    };
    Popper.prototype.modifiers.arrow = function (data) {
        var arrow = this._options.arrowElement;
        if (typeof arrow === 'string') {
            arrow = this._popper.querySelector(arrow);
        }
        if (!arrow) {
            return data;
        }
        if (!this._popper.contains(arrow)) {
            console.warn('WARNING: `arrowElement` must be child of its popper element!');
            return data;
        }
        if (!this.isModifierRequired(this.modifiers.arrow, this.modifiers.keepTogether)) {
            console.warn('WARNING: keepTogether modifier is required by arrow modifier in order to work, be sure to include it before arrow!');
            return data;
        }
        var arrowStyle = {};
        var placement = data.placement.split('-')[0];
        var popper = getPopperClientRect(data.offsets.popper);
        var reference = data.offsets.reference;
        var isVertical = [
            'left',
            'right'
        ].indexOf(placement) !== -1;
        var len = isVertical ? 'height' : 'width';
        var side = isVertical ? 'top' : 'left';
        var altSide = isVertical ? 'left' : 'top';
        var opSide = isVertical ? 'bottom' : 'right';
        var arrowSize = getOuterSizes(arrow)[len];
        if (reference[opSide] - arrowSize < popper[side]) {
            data.offsets.popper[side] -= popper[side] - (reference[opSide] - arrowSize);
        }
        if (reference[side] + arrowSize > popper[opSide]) {
            data.offsets.popper[side] += reference[side] + arrowSize - popper[opSide];
        }
        var center = reference[side] + reference[len] / 2 - arrowSize / 2;
        var sideValue = center - popper[side];
        sideValue = Math.max(Math.min(popper[len] - arrowSize, sideValue), 0);
        arrowStyle[side] = sideValue;
        arrowStyle[altSide] = '';
        data.offsets.arrow = arrowStyle;
        data.arrowElement = arrow;
        return data;
    };
    function getOuterSizes(element) {
        var _display = element.style.display, _visibility = element.style.visibility;
        element.style.display = 'block';
        element.style.visibility = 'hidden';
        var calcWidthToForceRepaint = element.offsetWidth;
        var styles = root.getComputedStyle(element);
        var x = parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);
        var y = parseFloat(styles.marginLeft) + parseFloat(styles.marginRight);
        var result = {
            width: element.offsetWidth + y,
            height: element.offsetHeight + x
        };
        element.style.display = _display;
        element.style.visibility = _visibility;
        return result;
    }
    function getOppositePlacement(placement) {
        var hash = {
            left: 'right',
            right: 'left',
            bottom: 'top',
            top: 'bottom'
        };
        return placement.replace(/left|right|bottom|top/g, function (matched) {
            return hash[matched];
        });
    }
    function getPopperClientRect(popperOffsets) {
        var offsets = Object.assign({}, popperOffsets);
        offsets.right = offsets.left + offsets.width;
        offsets.bottom = offsets.top + offsets.height;
        return offsets;
    }
    function getArrayKeyIndex(arr, keyToFind) {
        var i = 0, key;
        for (key in arr) {
            if (arr[key] === keyToFind) {
                return i;
            }
            i++;
        }
        return null;
    }
    function getStyleComputedProperty(element, property) {
        var css = root.getComputedStyle(element, null);
        return css[property];
    }
    function getOffsetParent(element) {
        var offsetParent = element.offsetParent;
        return offsetParent === root.document.body || !offsetParent ? root.document.documentElement : offsetParent;
    }
    function getScrollParent(element) {
        if (element === root.document) {
            if (root.document.body.scrollTop) {
                return root.document.body;
            } else {
                return root.document.documentElement;
            }
        }
        if ([
                'scroll',
                'auto'
            ].indexOf(getStyleComputedProperty(element, 'overflow')) !== -1 || [
                'scroll',
                'auto'
            ].indexOf(getStyleComputedProperty(element, 'overflow-x')) !== -1 || [
                'scroll',
                'auto'
            ].indexOf(getStyleComputedProperty(element, 'overflow-y')) !== -1) {
            return element;
        }
        return element.parentNode ? getScrollParent(element.parentNode) : element;
    }
    function isFixed(element) {
        if (element === root.document.body) {
            return false;
        }
        if (getStyleComputedProperty(element, 'position') === 'fixed') {
            return true;
        }
        return element.parentNode ? isFixed(element.parentNode) : element;
    }
    function setStyle(element, styles) {
        function is_numeric(n) {
            return n !== '' && !isNaN(parseFloat(n)) && isFinite(n);
        }
        Object.keys(styles).forEach(function (prop) {
            var unit = '';
            if ([
                    'width',
                    'height',
                    'top',
                    'right',
                    'bottom',
                    'left'
                ].indexOf(prop) !== -1 && is_numeric(styles[prop])) {
                unit = 'px';
            }
            element.style[prop] = styles[prop] + unit;
        });
    }
    function isFunction(functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }
    function getOffsetRect(element) {
        var elementRect = {
            width: element.offsetWidth,
            height: element.offsetHeight,
            left: element.offsetLeft,
            top: element.offsetTop
        };
        elementRect.right = elementRect.left + elementRect.width;
        elementRect.bottom = elementRect.top + elementRect.height;
        return elementRect;
    }
    function getBoundingClientRect(element) {
        var rect = element.getBoundingClientRect();
        return {
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            width: rect.right - rect.left,
            height: rect.bottom - rect.top
        };
    }
    function getOffsetRectRelativeToCustomParent(element, parent, fixed) {
        var elementRect = getBoundingClientRect(element);
        var parentRect = getBoundingClientRect(parent);
        if (fixed) {
            var scrollParent = getScrollParent(parent);
            parentRect.top += scrollParent.scrollTop;
            parentRect.bottom += scrollParent.scrollTop;
            parentRect.left += scrollParent.scrollLeft;
            parentRect.right += scrollParent.scrollLeft;
        }
        var rect = {
            top: elementRect.top - parentRect.top,
            left: elementRect.left - parentRect.left,
            bottom: elementRect.top - parentRect.top + elementRect.height,
            right: elementRect.left - parentRect.left + elementRect.width,
            width: elementRect.width,
            height: elementRect.height
        };
        return rect;
    }
    function getSupportedPropertyName(property) {
        var prefixes = [
            '',
            'ms',
            'webkit',
            'moz',
            'o'
        ];
        for (var i = 0; i < prefixes.length; i++) {
            var toCheck = prefixes[i] ? prefixes[i] + property.charAt(0).toUpperCase() + property.slice(1) : property;
            if (typeof root.document.body.style[toCheck] !== 'undefined') {
                return toCheck;
            }
        }
        return null;
    }
    if (!Object.assign) {
        Object.defineProperty(Object, 'assign', {
            enumerable: false,
            configurable: true,
            writable: true,
            value: function value(target) {
                if (target === undefined || target === null) {
                    throw new TypeError('Cannot convert first argument to object');
                }
                var to = Object(target);
                for (var i = 1; i < arguments.length; i++) {
                    var nextSource = arguments[i];
                    if (nextSource === undefined || nextSource === null) {
                        continue;
                    }
                    nextSource = Object(nextSource);
                    var keysArray = Object.keys(nextSource);
                    for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                        var nextKey = keysArray[nextIndex];
                        var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                        if (desc !== undefined && desc.enumerable) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
                return to;
            }
        });
    }
    return Popper;
}));
'use strict';
(function () {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== 'function') {
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }
        var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function fNOP() {
            }, fBound = function fBound() {
                return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
            };
        if (this.prototype) {
            fNOP.prototype = this.prototype;
        }
        fBound.prototype = new fNOP();
        return fBound;
    };
    if (typeof Element.prototype.matches !== 'function') {
        Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.webkitMatchesSelector || function matches(selector) {
            var element = this;
            var elements = (element.document || element.ownerDocument).querySelectorAll(selector);
            var index = 0;
            while (elements[index] && elements[index] !== element) {
                ++index;
            }
            return Boolean(elements[index]);
        };
    }
    if (typeof Element.prototype.closest !== 'function') {
        Element.prototype.closest = function closest(selector) {
            var element = this;
            while (element && element.nodeType === 1) {
                if (element.matches(selector)) {
                    return element;
                }
                element = element.parentNode;
            }
            return null;
        };
    }
}());
'use strict';
var Meanbee = Meanbee || {};
!('ShippingRules' in Meanbee) && (Meanbee.ShippingRules = {});
(function (ShippingRules) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    ctx.font = 'bold 10.8px sans-serif';
    var requests = [];
    ShippingRules.util = {
        toOptions: function toOptions(options, selected) {
            selected = Array.isArray(selected) ? selected : [selected];
            var html = [];
            options.forEach(function (option) {
                if ({}.toString.call(option.value) === '[object Array]') {
                    html.push(function () {
                        var $$a = document.createElement('optgroup');
                        $$a.setAttribute('label', option.label);
                        $$a.appendChildren(ShippingRules.util.toOptions(option.value, selected));
                        return $$a;
                    }());
                } else {
                    var optionElement = function () {
                        return function () {
                            var $$c = document.createElement('option');
                            $$c.setAttribute('value', option.value);
                            $$c.appendChildren(option.label);
                            return $$c;
                        }();
                    }();
                    if (~selected.indexOf(option.value))
                        optionElement.selected = true;
                    if (option.inputType)
                        optionElement.dataset.inputType = option.inputType;
                    if (option.type)
                        optionElement.dataset.type = option.type;
                    html.push(optionElement);
                }
            });
            return html;
        },
        constructInputField: function constructInputField(condition) {
            var comparator = ShippingRules.ajax.getComparators(condition.attribute).filter(function (x) {
                return x.value === condition.comparator;
            })[0];
            var conditionField = ShippingRules.ajax.getConditionFieldByValue(condition.attribute);
            var prefix = condition.prefix + '-c' + condition.id;
            if (!comparator) {
                return function () {
                    var $$e = document.createElement('input');
                    $$e.setAttribute('id', prefix + '-value');
                    return $$e;
                }();
            }
            var input = null;
            switch (comparator.inputType) {
            case 'x-interval':
                input = function () {
                    return function () {
                        var $$f = document.createElement('span');
                        $$f.setAttribute('id', prefix + '-value');
                        var $$g = document.createElement('input');
                        $$g.setAttribute('id', prefix + '-value-min');
                        $$f.appendChild($$g);
                        var $$h = document.createTextNode(' and ');
                        $$f.appendChild($$h);
                        var $$i = document.createElement('input');
                        $$i.setAttribute('id', prefix + '-value-max');
                        $$f.appendChild($$i);
                        return $$f;
                    }();
                }();
                Object.defineProperty(input, 'value', {
                    enumerable: true,
                    get: function get() {
                        return [
                            document.getElementById(input.id + '-min').value,
                            document.getElementById(input.id + '-max').value
                        ];
                    },
                    set: function set(value) {
                        if (value) {
                            document.getElementById(input.id + '-min').value = value[0];
                            document.getElementById(input.id + '-max').value = value[1];
                        }
                    }
                });
                break;
            case 'x-multiselect':
                input = function () {
                    return function () {
                        var $$j = document.createElement('select');
                        $$j.setAttribute('id', prefix + '-value');
                        $$j.setAttribute('multiple', 'multiple');
                        $$j.appendChildren(ShippingRules.util.toOptions(conditionField.options, condition.value));
                        return $$j;
                    }();
                }();
                break;
            case 'select':
                input = function () {
                    return function () {
                        var $$l = document.createElement('select');
                        $$l.setAttribute('id', prefix + '-value');
                        $$l.appendChildren(ShippingRules.util.toOptions(conditionField.options, condition.value));
                        return $$l;
                    }();
                }();
                break;
            default:
                input = function () {
                    return function () {
                        var $$n = document.createElement('input');
                        $$n.setAttribute('id', prefix + '-value');
                        $$n.setAttribute('type', comparator.inputType || 'text');
                        return $$n;
                    }();
                }();
                if (comparator.inputPattern) {
                    input.pattern = comparator.inputPattern;
                }
                break;
            }
            input.value = condition.value;
            input.addEventListener('keyup', function () {
                return condition.value = input.value;
            }, false);
            input.addEventListener('change', function () {
                return condition.value = input.value;
            }, false);
            return input;
        },
        addButton: function addButton(ctx, handler) {
            return function () {
                var $$o = document.createElement('button');
                $$o.setAttribute('id', ctx.prefix + '-t' + ctx.id + '-add');
                $$o.setAttribute('type', 'button');
                $$o.setAttribute('class', 'add');
                $$o.addEventListener('click', handler);
                return $$o;
            }();
        },
        removeButton: function removeButton(ctx, handler) {
            return function () {
                var $$p = document.createElement('button');
                $$p.setAttribute('id', ctx.id + '-remove');
                $$p.setAttribute('aria-label', 'Remove');
                $$p.setAttribute('type', 'button');
                $$p.setAttribute('class', 'remove');
                $$p.addEventListener('click', handler);
                return $$p;
            }();
        },
        fieldTextSize: function fieldTextSize(text) {
            return Math.floor(ctx.measureText(text).width) + 25 + 'px';
        },
        textWidth: function textWidth(text) {
            return ctx.measureText(text).width;
        },
        resizeFields: function resizeFields() {
            [].forEach.call(document.querySelectorAll('.calculator-tree select:not([multiple])'), function (select) {
                var text = select.selectedOptions[0] ? select.selectedOptions[0].innerText : '';
                select.style.width = ShippingRules.util.fieldTextSize(text);
            });
            [].forEach.call(document.querySelectorAll('.calculator-tree input'), function (input) {
                var text = input.value || '---';
                input.style.width = ShippingRules.util.fieldTextSize(text);
            });
        },
        loadData: function loadData(name) {
            var url = '/js/lib/Meanbee/ShippingRulesLibrary/data/' + name.replace(/([a-z])([A-Z])/g, function (_, $1, $2) {
                return $1 + '_' + $2.toLowerCase();
            }) + '.json';
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    if (!('data' in ShippingRules))
                        ShippingRules.data = {};
                    ShippingRules.data[name] = JSON.parse(xhr.responseText);
                }
            };
            xhr.send();
        }
    };
}(Meanbee.ShippingRules));
'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
(function (ShippingRules) {
    ShippingRules.Register = function () {
        function _class() {
            _classCallCheck(this, _class);
            this.children = {};
        }
        _createClass(_class, [
            {
                key: 'remove',
                value: function remove(key) {
                    var child = this.get(key);
                    delete this.children[key];
                    return child;
                }
            },
            {
                key: 'has',
                value: function has(key) {
                    return this.children.hasOwnProperty(key);
                }
            },
            {
                key: 'get',
                value: function get(key) {
                    return this.has(key) && this.children[key];
                }
            },
            {
                key: 'getAsOptions',
                value: function getAsOptions() {
                    var _this = this;
                    return Object.keys(this.children).map(function (key) {
                        return function () {
                            var $$a = document.createElement('option');
                            $$a.setAttribute('value', key);
                            $$a.appendChildren(_this.get(key).name());
                            return $$a;
                        }();
                    });
                }
            }
        ]);
        return _class;
    }();
}(Meanbee.ShippingRules));
'use strict';
(function (ShippingRules) {
    ShippingRules.Register.aggregator = new ShippingRules.Register();
    ShippingRules.Register.aggregator.add = function (key, child) {
        if (!this.has(key) && child.prototype instanceof ShippingRules.Aggregator) {
            this.children[key] = child;
        }
        return this;
    };
}(Meanbee.ShippingRules));
'use strict';
(function (ShippingRules) {
    ShippingRules.Register.comparator = new ShippingRules.Register();
    ShippingRules.Register.comparator.add = function (key, child) {
        if (!this.has(key) && child.prototype instanceof ShippingRules.Comparator) {
            this.children[key] = child;
        }
        return this;
    };
    ShippingRules.Register.comparator.getByType = function (type) {
        var _this = this;
        return Object.keys(this.children).reduce(function (accumulator, key) {
            if (_this.children[key].canHandleType(type)) {
                accumulator[key] = _this.children[key];
            }
            return accumulator;
        }, {});
    };
    ShippingRules.Register.comparator.getAsOptions = function (type, selectedName) {
        var options = type ? this.getByType(type) : this.children;
        return Object.keys(options).map(function (key) {
            var option = function () {
                var $$a = document.createElement('option');
                $$a.setAttribute('value', key);
                $$a.appendChildren(options[key].name(type));
                return $$a;
            }();
            option.selected = options[key].name(type) === selectedName;
            return option;
        });
    };
}(Meanbee.ShippingRules));
'use strict';
function _toConsumableArray(arr) {
    if (Array.isArray(arr)) {
        for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
            arr2[i] = arr[i];
        }
        return arr2;
    } else {
        return Array.from(arr);
    }
}
function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
(function (ShippingRules) {
    ShippingRules.Register.condition = new ShippingRules.Register();
    ShippingRules.Register.condition.add = function (key, child) {
        if (!this.has(key) && child.prototype instanceof ShippingRules.Condition) {
            this.children[key] = child;
        }
        return this;
    };
    ShippingRules.Register.condition.getAsOptions = function (context) {
        var _this = this;
        var categorised = Object.keys(this.children).map(function (key) {
            if (_this.children[key].loadDependencies)
                _this.children[key].loadDependencies();
            return _defineProperty({}, _this.children[key].getCategory(context), Object.keys(_this.children[key].getVariables(context)).map(function (variable) {
                return function () {
                    var $$a = document.createElement('option');
                    $$a.setAttribute('value', variable);
                    $$a.setAttribute('data-register-key', key);
                    $$a.appendChildren(_this.children[key].getVariables(context)[variable].label);
                    return $$a;
                }();
            }));
        }).reduce(function (accumulator, current) {
            var k = Object.keys(current)[0];
            if (!current[k].length)
                return accumulator;
            return Object.assign(accumulator, accumulator[k] ? _defineProperty({}, k, [].concat(_toConsumableArray(accumulator[k]), _toConsumableArray(current[k]))) : _defineProperty({}, k, current[k]));
        }, {});
        return Object.keys(categorised).map(function (category) {
            return function () {
                var $$c = document.createElement('optgroup');
                $$c.setAttribute('label', category);
                $$c.appendChildren(categorised[category]);
                return $$c;
            }();
        });
    };
}(Meanbee.ShippingRules));
'use strict';
(function (ShippingRules) {
    ShippingRules.Register.field = new ShippingRules.Register();
    ShippingRules.Register.field.add = function (key, child) {
        if (!this.has(key) && child.prototype instanceof ShippingRules.Field) {
            this.children[key] = child;
        }
        return this;
    };
}(Meanbee.ShippingRules));
'use strict';
(function (ShippingRules) {
    ShippingRules.Register.term = new ShippingRules.Register();
    ShippingRules.Register.term.add = function (key, child) {
        if (!this.has(key) && child.prototype instanceof ShippingRules.Term) {
            this.children[key] = child;
        }
        return this;
    };
}(Meanbee.ShippingRules));
'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
(function (ShippingRules) {
    ShippingRules.Base = function () {
        function _class(index, parent, container) {
            _classCallCheck(this, _class);
            this.index = index;
            this.parent = parent;
            this.container = container;
        }
        _createClass(_class, [
            {
                key: 'init',
                value: function init() {
                }
            },
            {
                key: 'getObjectById',
                value: function getObjectById(id) {
                    if (this.id === id) {
                        return this;
                    }
                    if (this.aggregator) {
                        var aggregatorResult = this.aggregator.getObjectById(id);
                        if (aggregatorResult) {
                            return aggregatorResult;
                        }
                    }
                    if (!this.children) {
                        return null;
                    }
                    for (var i = 0; i < this.children.length; i++) {
                        var childResult = this.children[i].getObjectById(id);
                        if (childResult) {
                            return childResult;
                        }
                    }
                    return null;
                }
            },
            {
                key: 'rerender',
                value: function rerender() {
                    var focussedElementId = document.activeElement.id;
                    this.container.innerHTML = '';
                    this.container.appendChild(this.render());
                    ShippingRules.util.resizeFields();
                    this.focus(focussedElementId);
                    this.root.updateJSON();
                }
            },
            {
                key: 'updateJSON',
                value: function updateJSON() {
                    this.root.field.value = JSON.stringify(this.root);
                }
            },
            {
                key: 'focus',
                value: function focus(id) {
                    var element = document.getElementById(id);
                    if (element) {
                        element.focus();
                    }
                }
            },
            {
                key: 'renderRemoveButton',
                value: function renderRemoveButton() {
                    var _this = this;
                    if (this.parent instanceof ShippingRules.Base) {
                        return ShippingRules.util.removeButton(this, function () {
                            document.getElementById(_this.id).className += 'deleting';
                            _this.parent.removeChildByIndex(_this.index);
                            setTimeout(_this.root.rerender.bind(_this.root), 200);
                            _this.focus(_this.id);
                        });
                    }
                    return [];
                }
            },
            {
                key: 'keyHandler',
                value: function keyHandler(event) {
                    var i = undefined;
                    var caught = false;
                    if (~[
                            'INPUT',
                            'SELECT',
                            'BUTTON',
                            'TEXTAREA'
                        ].indexOf(event.target.tagName)) {
                        caught = true;
                        if (event.keyCode === 27) {
                            event.preventDefault();
                            event.target.closest('li').focus();
                        }
                    } else {
                        switch (event.keyCode) {
                        case 13:
                            if (event.target.tagName === 'LI') {
                                caught = true;
                                event.target.querySelector('input, select, button, textarea').focus();
                            }
                            break;
                        case 37:
                            if (event.target.tagName === 'LI') {
                                caught = true;
                                if (event.target.parentElement.parentElement.tagName === 'LI') {
                                    event.target.parentElement.parentElement.focus();
                                } else if (event.target.parentElement.parentElement.parentElement.tagName === 'LI') {
                                    event.target.parentElement.parentElement.parentElement.focus();
                                }
                            }
                            break;
                        case 38:
                            caught = true;
                            if (event.target.tagName === 'LI') {
                                event.preventDefault();
                                var treeItems = Array.from(this.root.container.querySelectorAll('li'));
                                i = treeItems.indexOf(event.target);
                                if (treeItems[i - 1]) {
                                    treeItems[i - 1].focus();
                                }
                            }
                            break;
                        case 39:
                            caught = true;
                            if (event.target.tagName === 'LI') {
                                event.preventDefault();
                                if (~(i = Array.from(event.target.children).map(function (child) {
                                        return child.tagName;
                                    }).indexOf('UL'))) {
                                    event.target.children[i].children[0].focus();
                                } else if (~(i = Array.from(event.target.lastChild.children).map(function (child) {
                                        return child.tagName;
                                    }).indexOf('UL'))) {
                                    event.target.lastChild.children[i].children[0].focus();
                                }
                            }
                            break;
                        case 40:
                            caught = true;
                            if (event.target.tagName === 'LI') {
                                var treeItems = Array.from(this.root.container.querySelectorAll('li'));
                                i = treeItems.indexOf(event.target);
                                if (treeItems[i + 1]) {
                                    treeItems[i + 1].focus();
                                }
                            }
                            break;
                        case 45:
                        case 59:
                        case 61:
                        case 107:
                        case 187:
                            caught = true;
                            if (event.target.tagName === 'LI') {
                                var target = this.root.getObjectById(event.target.id);
                                while (target.children === void 0) {
                                    target = target.parent;
                                }
                                this.focus(target.id + '-childselector');
                            }
                            break;
                        case 8:
                        case 46:
                        case 109:
                        case 173:
                        case 189:
                            caught = true;
                            if (event.target.tagName === 'LI') {
                                var target = this.root.getObjectById(event.target.id);
                                if (target && target.parent) {
                                    event.target.className += 'deleting';
                                    target.parent.removeChildByIndex(target.index);
                                    this.focus(target.id);
                                    if ((target = target.parent.children[target.index - 1]) && event.keyCode === 8) {
                                        this.focus(target.id);
                                    }
                                    setTimeout(this.root.rerender.bind(this.root), 200);
                                }
                            }
                            break;
                        default:
                        }
                        if (caught) {
                            event.preventDefault();
                        }
                    }
                    if (caught) {
                        event.stopPropagation();
                    }
                }
            },
            {
                key: 'index',
                set: function set(param) {
                    this._index = param;
                    return this;
                },
                get: function get() {
                    return this._index;
                }
            },
            {
                key: 'id',
                get: function get() {
                    if (this.parent instanceof ShippingRules.Base) {
                        return this.parent.id + '.' + this.index;
                    } else {
                        return this.index;
                    }
                }
            },
            {
                key: 'root',
                get: function get() {
                    var root = this;
                    while (root.parent instanceof ShippingRules.Base) {
                        root = root.parent;
                    }
                    return root;
                }
            },
            {
                key: 'context',
                set: function set(context) {
                    this._context = context;
                    return this;
                },
                get: function get() {
                    return this._context || this.parent && this.parent.context;
                }
            },
            {
                key: 'field',
                set: function set(input) {
                    this._field = input;
                    this.init(JSON.parse(input.value));
                    return this;
                },
                get: function get() {
                    return this._field;
                }
            }
        ]);
        return _class;
    }();
}(Meanbee.ShippingRules));
'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
(function (ShippingRules) {
    ShippingRules.Aggregator = function (_ShippingRules$Base) {
        _inherits(_class, _ShippingRules$Base);
        function _class(index) {
            var parent = arguments.length <= 1 || arguments[1] === undefined ? function () {
                var $$a = document.createElement('noscript');
                return $$a;
            }() : arguments[1];
            var container = arguments[2];
            _classCallCheck(this, _class);
            var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, index, parent, container));
            _this.children = [];
            _this.combinator = null;
            return _this;
        }
        _createClass(_class, [
            {
                key: 'removeChildByIndex',
                value: function removeChildByIndex(index) {
                    this.children.splice(index, 1);
                    this.reindexChildren();
                }
            },
            {
                key: 'reindexChildren',
                value: function reindexChildren() {
                    this.children.forEach(function (child, i) {
                        return child.index = i;
                    });
                    return this;
                }
            },
            {
                key: 'sortChildren',
                value: function sortChildren() {
                    this.children = this.children.sort(function (a, b) {
                        return a.index - b.index;
                    });
                    return this;
                }
            },
            {
                key: 'renderChildren',
                value: function renderChildren() {
                    var me = this;
                    return function () {
                        var $$b = document.createElement('ul');
                        $$b.appendChildren(me.children.map(function (child) {
                            return child.render();
                        }));
                        $$b.appendChildren(me.renderChildSelector());
                        return $$b;
                    }();
                }
            },
            {
                key: 'init',
                value: function init(obj) {
                    if (obj.register !== 'Aggregator' || ShippingRules.Register.aggregator.get(obj.key) !== this.constructor) {
                        return;
                    }
                    this.combinator = obj.type;
                }
            },
            {
                key: 'toJSON',
                value: function toJSON() {
                    return {
                        children: this.children,
                        register: 'Aggregator',
                        key: this.combinator
                    };
                }
            }
        ]);
        return _class;
    }(ShippingRules.Base);
}(Meanbee.ShippingRules));
'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined;
        } else {
            return get(parent, property, receiver);
        }
    } else if ('value' in desc) {
        return desc.value;
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined;
        }
        return getter.call(receiver);
    }
};
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
(function (ShippingRules) {
    ShippingRules.Aggregator.Boolean = function (_ShippingRules$Aggreg) {
        _inherits(_class, _ShippingRules$Aggreg);
        function _class(index) {
            var parent = arguments.length <= 1 || arguments[1] === undefined ? function () {
                var $$a = document.createElement('noscript');
                return $$a;
            }() : arguments[1];
            var container = arguments[2];
            _classCallCheck(this, _class);
            var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, index, parent, container));
            _this.combinator = ShippingRules.Aggregator.Boolean.CONJUNCTIVE;
            _this.value = true;
            return _this;
        }
        _createClass(_class, [
            {
                key: 'addChild',
                value: function addChild(childClass, index) {
                    index = index === void 0 || index === null ? this.children.length : index;
                    if (childClass.loadDependencies)
                        childClass.loadDependencies();
                    for (var _len = arguments.length, params = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                        params[_key - 2] = arguments[_key];
                    }
                    var reindex = index !== this.children.length, child = new (Function.prototype.bind.apply(childClass, [null].concat([
                            index,
                            this
                        ], params)))();
                    if (child instanceof ShippingRules.Condition || child instanceof this.constructor) {
                        this.children.splice(index, 0, child);
                        if (reindex)
                            this.reindexChildren();
                        return this.children[index];
                    } else {
                        console.error('ShippingRules: Boolean Aggregators only accept Conditions and Boolean Aggregators: ' + childClass + ' passed.');
                    }
                }
            },
            {
                key: 'replaceChildByIndex',
                value: function replaceChildByIndex(newChildClass, index) {
                    this.removeChildByIndex(index);
                    for (var _len2 = arguments.length, params = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
                        params[_key2 - 2] = arguments[_key2];
                    }
                    this.addChild.apply(this, [
                        newChildClass,
                        index
                    ].concat(params));
                    return this;
                }
            },
            {
                key: 'renderCombinator',
                value: function renderCombinator() {
                    var me = this;
                    return function () {
                        var $$b = document.createElement('select');
                        $$b.setAttribute('id', me.id + '-combinator');
                        $$b.addEventListener('change', function (event) {
                            return me.combinator = event.target.value;
                        });
                        var $$c = document.createElement('option');
                        $$c.setAttribute('value', ShippingRules.Aggregator.Boolean.CONJUNCTIVE);
                        $$b.appendChild($$c);
                        var $$d = document.createTextNode('ALL');
                        $$c.appendChild($$d);
                        var $$e = document.createElement('option');
                        $$e.setAttribute('value', ShippingRules.Aggregator.Boolean.DISJUNCTIVE);
                        $$b.appendChild($$e);
                        var $$f = document.createTextNode('ANY');
                        $$e.appendChild($$f);
                        return $$b;
                    }();
                }
            },
            {
                key: 'renderValue',
                value: function renderValue() {
                    var me = this;
                    return function () {
                        var $$g = document.createElement('select');
                        $$g.setAttribute('id', me.id + '-value');
                        $$g.addEventListener('change', function (event) {
                            return me.value = !!+event.target.value;
                        });
                        var $$h = document.createElement('option');
                        $$h.setAttribute('value', '1');
                        $$g.appendChild($$h);
                        var $$i = document.createTextNode('TRUE');
                        $$h.appendChild($$i);
                        var $$j = document.createElement('option');
                        $$j.setAttribute('value', '0');
                        $$g.appendChild($$j);
                        var $$k = document.createTextNode('FALSE');
                        $$j.appendChild($$k);
                        return $$g;
                    }();
                }
            },
            {
                key: 'renderChildSelector',
                value: function renderChildSelector() {
                    var me = this;
                    return function () {
                        var $$l = document.createElement('li');
                        $$l.setAttribute('id', me.id + '.' + me.children.length);
                        $$l.addEventListener('keydown', me.keyHandler.bind(me));
                        $$l.setAttribute('tabIndex', 0);
                        var $$m = document.createElement('select');
                        $$m.setAttribute('id', me.id + '-childselector');
                        $$m.setAttribute('aria-label', 'Condition');
                        $$m.addEventListener('change', function (event) {
                            var selected = event.target.selectedOptions[0];
                            var registerKey = selected.getAttribute('data-register-key');
                            var variable = selected.value;
                            var id = undefined;
                            if (variable === 'this') {
                                id = me.addChild(me.constructor).id;
                            } else {
                                id = me.addChild(ShippingRules.Register.condition.get(registerKey), void 0, variable).id;
                            }
                            me.root.rerender();
                            me.root.focus(id);
                        });
                        $$l.appendChild($$m);
                        var $$n = document.createElement('option');
                        $$n.disabled = true;
                        $$n.setAttribute('selected', 'selected');
                        $$m.appendChild($$n);
                        var $$o = document.createTextNode('[SELECT]');
                        $$n.appendChild($$o);
                        $$m.appendChildren(ShippingRules.Register.condition.getAsOptions(me.context));
                        var $$q = document.createElement('option');
                        $$q.setAttribute('value', 'this');
                        $$m.appendChild($$q);
                        var $$r = document.createTextNode('Condition Combination');
                        $$q.appendChild($$r);
                        return $$l;
                    }();
                }
            },
            {
                key: 'render',
                value: function render() {
                    var me = this;
                    return function () {
                        var $$s = document.createElement('li');
                        $$s.setAttribute('id', me.id);
                        $$s.addEventListener('keydown', me.keyHandler.bind(me));
                        $$s.setAttribute('tabIndex', 0);
                        var $$t = document.createTextNode('\n                If ');
                        $$s.appendChild($$t);
                        $$s.appendChildren(me.renderCombinator());
                        var $$v = document.createTextNode(' of these conditions are ');
                        $$s.appendChild($$v);
                        $$s.appendChildren(me.renderValue());
                        var $$x = document.createTextNode(': ');
                        $$s.appendChild($$x);
                        $$s.appendChildren(me.renderRemoveButton());
                        $$s.appendChildren(me.renderChildren());
                        return $$s;
                    }();
                }
            },
            {
                key: 'refresh',
                value: function refresh() {
                    this.children.forEach(function (c) {
                        return c.refresh();
                    });
                }
            },
            {
                key: 'init',
                value: function init(obj) {
                    var _this2 = this;
                    _get(Object.getPrototypeOf(_class.prototype), 'init', this).call(this, obj);
                    this.value = typeof obj.value === 'boolean' ? obj.value : true;
                    if (obj.children) {
                        obj.children.forEach(function (child) {
                            if (child.register === 'Condition') {
                                _this2.addChild(ShippingRules.Register.condition.get(child.key)).init(child);
                            } else if (child.register === 'Aggregator') {
                                _this2.addChild(ShippingRules.Register.aggregator.get(child.key)).init(child);
                            }
                        });
                    }
                }
            },
            {
                key: 'toJSON',
                value: function toJSON() {
                    var obj = _get(Object.getPrototypeOf(_class.prototype), 'toJSON', this).call(this);
                    obj.value = this.value;
                    return obj;
                }
            },
            {
                key: 'combinator',
                set: function set(param) {
                    if (~[
                            ShippingRules.Aggregator.Boolean.CONJUNCTIVE,
                            ShippingRules.Aggregator.Boolean.DISJUNCTIVE
                        ].indexOf(param)) {
                        this._combinator = param;
                    }
                    return this;
                },
                get: function get() {
                    return this._combinator;
                }
            }
        ]);
        return _class;
    }(ShippingRules.Aggregator);
    Object.defineProperties(ShippingRules.Aggregator.Boolean, {
        CONJUNCTIVE: { value: 'Conjunctive' },
        DISJUNCTIVE: { value: 'Disjunctive' }
    });
    ShippingRules.Register.aggregator.add('Boolean', ShippingRules.Aggregator.Boolean);
}(Meanbee.ShippingRules));
'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined;
        } else {
            return get(parent, property, receiver);
        }
    } else if ('value' in desc) {
        return desc.value;
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined;
        }
        return getter.call(receiver);
    }
};
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
(function (ShippingRules) {
    ShippingRules.Aggregator.Numeric = function (_ShippingRules$Aggreg) {
        _inherits(_class, _ShippingRules$Aggreg);
        function _class(index) {
            var parent = arguments.length <= 1 || arguments[1] === undefined ? function () {
                var $$a = document.createElement('noscript');
                return $$a;
            }() : arguments[1];
            var container = arguments[2];
            _classCallCheck(this, _class);
            var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, index, parent, container));
            _this.combinator = 'Summative';
            return _this;
        }
        _createClass(_class, [
            {
                key: 'addChild',
                value: function addChild(childClass, index) {
                    index = index === void 0 || index === null ? this.children.length : index;
                    for (var _len = arguments.length, params = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                        params[_key - 2] = arguments[_key];
                    }
                    var reindex = index !== this.children.length, child = new (Function.prototype.bind.apply(childClass, [null].concat([
                            index,
                            this
                        ], params)))();
                    if (child instanceof ShippingRules.Term || child instanceof this.constructor) {
                        this.children.splice(index, 0, child);
                        if (reindex)
                            this.reindexChildren();
                        return this.children[index];
                    } else {
                        console.error('ShippingRules: Numeric Aggregators only accept Terms and Numeric Aggregators: ' + childClass + ' passed.');
                    }
                }
            },
            {
                key: 'replaceChildByIndex',
                value: function replaceChildByIndex(newChildClass, index) {
                    this.removeChildByIndex(index);
                    for (var _len2 = arguments.length, params = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
                        params[_key2 - 2] = arguments[_key2];
                    }
                    this.addChild.apply(this, [
                        newChildClass,
                        index
                    ].concat(params));
                    return this;
                }
            },
            {
                key: 'renderChildSelector',
                value: function renderChildSelector() {
                    var me = this;
                    return function () {
                        var $$b = document.createElement('li');
                        $$b.setAttribute('id', me.id + '.' + me.children.length);
                        $$b.addEventListener('keydown', me.keyHandler.bind(me));
                        $$b.setAttribute('tabIndex', 0);
                        var $$c = document.createElement('select');
                        $$c.setAttribute('id', me.id + '-childselector');
                        $$c.setAttribute('aria-label', 'Type of value');
                        $$c.addEventListener('change', function (event) {
                            var child = event.target.value === 'this' ? me.constructor : ShippingRules.Register.term.get(event.target.value);
                            var id = me.addChild(child).id;
                            me.root.rerender();
                            me.root.focus(id);
                        });
                        $$b.appendChild($$c);
                        var $$d = document.createElement('option');
                        $$d.disabled = true;
                        $$d.setAttribute('selected', 'selected');
                        $$c.appendChild($$d);
                        var $$e = document.createTextNode('[SELECT]');
                        $$d.appendChild($$e);
                        $$c.appendChildren(ShippingRules.Register.term.getAsOptions());
                        var $$g = document.createElement('option');
                        $$g.setAttribute('value', 'this');
                        $$c.appendChild($$g);
                        var $$h = document.createTextNode('Sum of values');
                        $$g.appendChild($$h);
                        return $$b;
                    }();
                }
            },
            {
                key: 'render',
                value: function render() {
                    var me = this;
                    return function () {
                        var $$i = document.createElement('li');
                        $$i.setAttribute('id', me.id);
                        $$i.addEventListener('keydown', me.keyHandler.bind(me));
                        $$i.setAttribute('tabIndex', 0);
                        var $$j = document.createTextNode('\n                Sum of these values: ');
                        $$i.appendChild($$j);
                        $$i.appendChildren(me.renderRemoveButton());
                        $$i.appendChildren(me.renderChildren());
                        return $$i;
                    }();
                }
            },
            {
                key: 'init',
                value: function init(obj) {
                    var _this2 = this;
                    _get(Object.getPrototypeOf(_class.prototype), 'init', this).call(this, obj);
                    if (obj.children) {
                        obj.children.forEach(function (child) {
                            if (child.register === 'Term') {
                                _this2.addChild(ShippingRules.Register.term.get(child.key)).init(child);
                            } else if (child.register === 'Aggregator') {
                                _this2.addChild(ShippingRules.Register.aggregator.get(child.key)).init(child);
                            }
                        });
                    }
                }
            }
        ]);
        return _class;
    }(ShippingRules.Aggregator);
    ShippingRules.Register.aggregator.add('Numeric', ShippingRules.Aggregator.Numeric);
}(Meanbee.ShippingRules));
'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
(function (ShippingRules) {
    ShippingRules.Term = function (_ShippingRules$Base) {
        _inherits(_class, _ShippingRules$Base);
        function _class(index, parent) {
            _classCallCheck(this, _class);
            var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, index, parent));
            _this._value = 0;
            return _this;
        }
        _createClass(_class, [
            {
                key: 'init',
                value: function init(obj) {
                    if (obj.register !== 'Term' || ShippingRules.Register.term.get(obj.key) !== this.constructor) {
                        return;
                    }
                    this.combinator = obj.type;
                }
            },
            {
                key: 'toJSON',
                value: function toJSON() {
                    return {
                        register: 'Term',
                        value: this.value
                    };
                }
            },
            {
                key: 'value',
                set: function set(param) {
                    if (!isNaN(parseInt(param, 10))) {
                        this._value = parseInt(param, 10);
                    }
                    return this;
                },
                get: function get() {
                    return this._value;
                }
            }
        ]);
        return _class;
    }(ShippingRules.Base);
}(Meanbee.ShippingRules));
'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined;
        } else {
            return get(parent, property, receiver);
        }
    } else if ('value' in desc) {
        return desc.value;
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined;
        }
        return getter.call(receiver);
    }
};
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
(function (ShippingRules) {
    ShippingRules.Term.Conditional = function (_ShippingRules$Term) {
        _inherits(_class, _ShippingRules$Term);
        function _class(index, parent) {
            _classCallCheck(this, _class);
            var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, index, parent));
            _this.aggregator = new ShippingRules.Aggregator.Boolean(0, _this);
            return _this;
        }
        _createClass(_class, [
            {
                key: 'renderValue',
                value: function renderValue() {
                    var me = this;
                    return function () {
                        var $$a = document.createElement('input');
                        $$a.setAttribute('id', me.id + '-value');
                        $$a.setAttribute('type', 'number');
                        $$a.setAttribute('value', me.value);
                        $$a.addEventListener('keydown', function (event) {
                            return me.value = event.target.value;
                        });
                        return $$a;
                    }();
                }
            },
            {
                key: 'render',
                value: function render() {
                    var me = this;
                    return function () {
                        var $$b = document.createElement('li');
                        $$b.setAttribute('id', me.id);
                        $$b.addEventListener('keydown', me.keyHandler.bind(me));
                        $$b.setAttribute('tabIndex', 0);
                        var $$c = document.createTextNode('\n                Constant value of ');
                        $$b.appendChild($$c);
                        $$b.appendChildren(me.renderValue());
                        var $$e = document.createElement('span');
                        $$e.setAttribute('id', me.aggregator.id);
                        $$b.appendChild($$e);
                        var $$f = document.createTextNode('\n                    if ');
                        $$e.appendChild($$f);
                        $$e.appendChildren(me.aggregator.renderCombinator());
                        var $$h = document.createTextNode(' of these conditions are ');
                        $$e.appendChild($$h);
                        $$e.appendChildren(me.aggregator.renderValue());
                        var $$j = document.createTextNode(': ');
                        $$e.appendChild($$j);
                        $$e.appendChildren(me.renderRemoveButton());
                        $$e.appendChildren(me.aggregator.renderChildren());
                        return $$b;
                    }();
                }
            },
            {
                key: 'init',
                value: function init(obj) {
                    _get(Object.getPrototypeOf(_class.prototype), 'init', this).call(this, obj);
                    this.aggregator.init(obj.aggregator);
                }
            },
            {
                key: 'toJSON',
                value: function toJSON() {
                    var obj = _get(Object.getPrototypeOf(_class.prototype), 'toJSON', this).call(this);
                    obj.key = 'Conditional';
                    obj.aggregator = this.aggregator;
                    return obj;
                }
            }
        ], [{
                key: 'name',
                value: function name() {
                    return 'Conditional Value';
                }
            }]);
        return _class;
    }(ShippingRules.Term);
    ShippingRules.Register.term.add('Conditional', ShippingRules.Term.Conditional);
}(Meanbee.ShippingRules));
'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined;
        } else {
            return get(parent, property, receiver);
        }
    } else if ('value' in desc) {
        return desc.value;
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined;
        }
        return getter.call(receiver);
    }
};
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
(function (ShippingRules) {
    ShippingRules.Term.Constant = function (_ShippingRules$Term) {
        _inherits(_class, _ShippingRules$Term);
        function _class(index, parent) {
            _classCallCheck(this, _class);
            return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, index, parent));
        }
        _createClass(_class, [
            {
                key: 'renderValue',
                value: function renderValue() {
                    var me = this;
                    return function () {
                        var $$a = document.createElement('input');
                        $$a.setAttribute('id', me.id + '-value');
                        $$a.setAttribute('type', 'number');
                        $$a.setAttribute('value', me.value);
                        $$a.addEventListener('keydown', function (event) {
                            return me.value = event.target.value;
                        });
                        return $$a;
                    }();
                }
            },
            {
                key: 'render',
                value: function render() {
                    var me = this;
                    return function () {
                        var $$b = document.createElement('li');
                        $$b.setAttribute('id', me.id);
                        $$b.addEventListener('keydown', me.keyHandler.bind(me));
                        $$b.setAttribute('tabIndex', 0);
                        var $$c = document.createTextNode('Constant value of ');
                        $$b.appendChild($$c);
                        $$b.appendChildren(me.renderValue());
                        $$b.appendChildren(me.renderRemoveButton());
                        return $$b;
                    }();
                }
            },
            {
                key: 'toJSON',
                value: function toJSON() {
                    var obj = _get(Object.getPrototypeOf(_class.prototype), 'toJSON', this).call(this);
                    obj.key = 'Constant';
                    return obj;
                }
            }
        ], [{
                key: 'name',
                value: function name() {
                    return 'Constant Value';
                }
            }]);
        return _class;
    }(ShippingRules.Term);
    ShippingRules.Register.term.add('Constant', ShippingRules.Term.Constant);
}(Meanbee.ShippingRules));
'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined;
        } else {
            return get(parent, property, receiver);
        }
    } else if ('value' in desc) {
        return desc.value;
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined;
        }
        return getter.call(receiver);
    }
};
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
(function (ShippingRules) {
    ShippingRules.Term.ProductSubselection = function (_ShippingRules$Term) {
        _inherits(_class, _ShippingRules$Term);
        function _class(index, parent) {
            _classCallCheck(this, _class);
            var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, index, parent));
            _this.aggregator = new ShippingRules.Aggregator.Boolean(0, _this);
            _this.aggregator.context = _this;
            _this.multiplier = 1;
            return _this;
        }
        _createClass(_class, [
            {
                key: 'renderMultiplier',
                value: function renderMultiplier() {
                    var me = this;
                    return function () {
                        var $$a = document.createElement('input');
                        $$a.setAttribute('id', me.id + '-multiplier');
                        $$a.setAttribute('type', 'number');
                        $$a.setAttribute('value', me.multiplier);
                        $$a.addEventListener('keydown', function (event) {
                            return me.multiplier = event.target.value;
                        });
                        return $$a;
                    }();
                }
            },
            {
                key: 'renderAttributeSelector',
                value: function renderAttributeSelector() {
                    var me = this;
                    return function () {
                        var $$b = document.createElement('select');
                        $$b.setAttribute('id', me.id + '-attribute');
                        return $$b;
                    }();
                }
            },
            {
                key: 'render',
                value: function render() {
                    var me = this;
                    return function () {
                        var $$c = document.createElement('li');
                        $$c.setAttribute('id', me.id);
                        $$c.addEventListener('keydown', me.keyHandler.bind(me));
                        $$c.setAttribute('tabIndex', 0);
                        var $$d = document.createTextNode('\n                Sum of ');
                        $$c.appendChild($$d);
                        $$c.appendChildren(me.renderAttributeSelector());
                        var $$f = document.createTextNode(' \u2715 ');
                        $$c.appendChild($$f);
                        $$c.appendChildren(me.renderMultiplier());
                        var $$h = document.createTextNode(' for a subselection of items in cart where ');
                        $$c.appendChild($$h);
                        $$c.appendChildren(me.aggregator.renderCombinator());
                        var $$j = document.createTextNode(' of these conditions are ');
                        $$c.appendChild($$j);
                        $$c.appendChildren(me.aggregator.renderValue());
                        var $$l = document.createTextNode(': ');
                        $$c.appendChild($$l);
                        $$c.appendChildren(me.renderRemoveButton());
                        $$c.appendChildren(me.aggregator.renderChildren());
                        return $$c;
                    }();
                }
            },
            {
                key: 'toJSON',
                value: function toJSON() {
                    var obj = _get(Object.getPrototypeOf(_class.prototype), 'toJSON', this).call(this);
                    obj.key = 'ProductSubselection';
                    return obj;
                }
            }
        ], [{
                key: 'name',
                value: function name() {
                    return 'Product Subselection';
                }
            }]);
        return _class;
    }(ShippingRules.Term);
    ShippingRules.Register.term.add('ProductSubselection', ShippingRules.Term.ProductSubselection);
}(Meanbee.ShippingRules));
'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
(function (ShippingRules) {
    ShippingRules.Condition = function (_ShippingRules$Base) {
        _inherits(_class, _ShippingRules$Base);
        function _class(index, parent, variable) {
            _classCallCheck(this, _class);
            var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, index, parent));
            _this.variable = variable;
            var validComparators = ShippingRules.Register.comparator.getByType(_this.type);
            var comparator = validComparators[Object.keys(validComparators)[0]];
            _this.comparator = comparator ? new comparator(_this.type) : function () {
                var $$a = document.createElement('noscript');
                return $$a;
            }();
            _this.value = '';
            _this.valueField = comparator ? new (ShippingRules.Register.field.get(_this.comparator.getField()))(_this, _this.value) : function () {
                var $$b = document.createElement('noscript');
                return $$b;
            }();
            return _this;
        }
        _createClass(_class, [
            {
                key: 'renderComparator',
                value: function renderComparator() {
                    var _this2 = this;
                    var me = this;
                    return function () {
                        var $$c = document.createElement('select');
                        $$c.setAttribute('id', me.id + '-comparator');
                        $$c.addEventListener('change', function (event) {
                            me.comparator = new (ShippingRules.Register.comparator.get(event.target.value))(_this2.type);
                            me.valueField = new (ShippingRules.Register.field.get(me.comparator.getField()))(me, me.value);
                            me.root.rerender();
                        });
                        $$c.appendChildren(ShippingRules.Register.comparator.getAsOptions(me.type, me.comparator.name));
                        return $$c;
                    }();
                }
            },
            {
                key: 'valueChangeHandler',
                value: function valueChangeHandler(value) {
                    this.value = value;
                    this.root.updateJSON();
                }
            },
            {
                key: 'render',
                value: function render() {
                    var me = this;
                    return function () {
                        var $$e = document.createElement('li');
                        $$e.setAttribute('id', me.id);
                        $$e.setAttribute('tabIndex', 0);
                        $$e.appendChildren(me.label);
                        $$e.appendChildren(me.renderComparator());
                        $$e.appendChildren(me.valueField.render());
                        $$e.appendChildren(me.renderRemoveButton());
                        return $$e;
                    }();
                }
            },
            {
                key: 'refresh',
                value: function refresh() {
                }
            },
            {
                key: 'init',
                value: function init(obj) {
                    this.variable = obj.variable;
                    this.value = obj.value;
                    this.comparator = new (ShippingRules.Register.comparator.get(obj.comparator.key))(this.type);
                    this.valueField = new (ShippingRules.Register.field.get(this.comparator.getField()))(this, this.value);
                }
            },
            {
                key: 'toJSON',
                value: function toJSON() {
                    return {
                        register: 'Condition',
                        variable: this.variable,
                        comparator: this.comparator,
                        value: this.value
                    };
                }
            },
            {
                key: 'label',
                get: function get() {
                    var variable = this.constructor.getVariables(this.parent && this.parent.context)[this.variable];
                    return variable ? variable.label : '';
                }
            },
            {
                key: 'type',
                get: function get() {
                    var variable = this.constructor.getVariables(this.parent && this.parent.context)[this.variable];
                    return variable ? variable.type : [];
                }
            }
        ], [
            {
                key: 'getCategory',
                value: function getCategory(context) {
                    return null;
                }
            },
            {
                key: 'getVariables',
                value: function getVariables(context) {
                    return {};
                }
            }
        ]);
        return _class;
    }(ShippingRules.Base);
}(Meanbee.ShippingRules));
'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined;
        } else {
            return get(parent, property, receiver);
        }
    } else if ('value' in desc) {
        return desc.value;
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined;
        }
        return getter.call(receiver);
    }
};
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
(function (ShippingRules) {
    ShippingRules.Condition.Cart = function (_ShippingRules$Condit) {
        _inherits(_class, _ShippingRules$Condit);
        function _class(index, parent, variable) {
            _classCallCheck(this, _class);
            return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, index, parent, variable));
        }
        _createClass(_class, [{
                key: 'toJSON',
                value: function toJSON() {
                    var obj = _get(Object.getPrototypeOf(_class.prototype), 'toJSON', this).call(this);
                    obj.key = 'Cart';
                    return obj;
                }
            }], [
            {
                key: 'getCategory',
                value: function getCategory(context) {
                    return 'Cart Conditions';
                }
            },
            {
                key: 'getVariables',
                value: function getVariables(context) {
                    var variables = {};
                    if (!context) {
                        variables['package_weight'] = {
                            label: 'Total Weight',
                            type: ['number']
                        };
                        variables['package_quantity'] = {
                            label: 'Total Items Quantity',
                            type: ['number']
                        };
                        variables['package_value'] = {
                            label: 'Subtotal excl. Tax',
                            type: ['currency']
                        };
                        variables['base_subtotal_incl_tax'] = {
                            label: 'Subtotal incl. Tax',
                            type: ['currency']
                        };
                        variables['package_value_with_discount'] = {
                            label: 'Subtotal after Discount',
                            type: ['currency']
                        };
                    }
                    return variables;
                }
            }
        ]);
        return _class;
    }(ShippingRules.Condition);
    ShippingRules.Register.condition.add('Cart', ShippingRules.Condition.Cart);
}(Meanbee.ShippingRules));
'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined;
        } else {
            return get(parent, property, receiver);
        }
    } else if ('value' in desc) {
        return desc.value;
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined;
        }
        return getter.call(receiver);
    }
};
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
(function (ShippingRules) {
    ShippingRules.Condition.Customer = function (_ShippingRules$Condit) {
        _inherits(_class, _ShippingRules$Condit);
        function _class(index, parent, variable) {
            _classCallCheck(this, _class);
            return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, index, parent, variable));
        }
        _createClass(_class, [{
                key: 'toJSON',
                value: function toJSON() {
                    var obj = _get(Object.getPrototypeOf(_class.prototype), 'toJSON', this).call(this);
                    obj.key = 'Customer';
                    return obj;
                }
            }], [
            {
                key: 'getCategory',
                value: function getCategory(context) {
                    return 'Customer Conditions';
                }
            },
            {
                key: 'getVariables',
                value: function getVariables(context) {
                    var variables = {};
                    if (!context) {
                        variables['customer_group'] = {
                            label: 'Customer Group',
                            type: ['number']
                        };
                    }
                    return variables;
                }
            }
        ]);
        return _class;
    }(ShippingRules.Condition);
    ShippingRules.Register.condition.add('Customer', ShippingRules.Condition.Customer);
}(Meanbee.ShippingRules));
'use strict';
var _typeof = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? function (obj) {
    return typeof obj;
} : function (obj) {
    return obj && typeof Symbol === 'function' && obj.constructor === Symbol ? 'symbol' : typeof obj;
};
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined;
        } else {
            return get(parent, property, receiver);
        }
    } else if ('value' in desc) {
        return desc.value;
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined;
        }
        return getter.call(receiver);
    }
};
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
(function (ShippingRules) {
    ShippingRules.Condition.PostalCode = function (_ShippingRules$Condit) {
        _inherits(_class, _ShippingRules$Condit);
        function _class(index, parent, variable) {
            _classCallCheck(this, _class);
            var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, index, parent, variable));
            _this.aggregator = new ShippingRules.Aggregator.Boolean(0, _this);
            _this.aggregator.context = _this;
            _this.format = null;
            return _this;
        }
        _createClass(_class, [
            {
                key: 'renderFormatDecoration',
                value: function renderFormatDecoration() {
                    var _this2 = this;
                    return ShippingRules.data.postalCodeFormats.filter(function (f) {
                        return f.value === _this2.format && ShippingRules.util.textWidth(f.decoration) < 2 * ShippingRules.util.textWidth('\uD83C\uDDE6');
                    }).map(function (f) {
                        return function () {
                            var $$a = document.createElement('span');
                            $$a.appendChildren(f.decoration);
                            return $$a;
                        }();
                    });
                }
            },
            {
                key: 'renderFormatSelector',
                value: function renderFormatSelector() {
                    var me = this;
                    return function () {
                        var $$c = document.createElement('select');
                        $$c.setAttribute('id', me.id + '-format');
                        $$c.addEventListener('change', function (event) {
                            me.format = event.target.value;
                            me.refresh();
                            me.root.rerender();
                        });
                        var $$d = document.createElement('option');
                        $$d.disabled = true;
                        $$d.setAttribute('selected', !me.format);
                        $$c.appendChild($$d);
                        var $$e = document.createTextNode('[SELECT]');
                        $$d.appendChild($$e);
                        $$c.appendChildren(ShippingRules.data.postalCodeFormats.sort(function (a, b) {
                            return a.label.toUpperCase() < b.label.toUpperCase() ? -1 : 1;
                        }).map(function (format) {
                            var option = function () {
                                var $$g = document.createElement('option');
                                $$g.setAttribute('value', format.value);
                                $$g.setAttribute('dir', 'rtl');
                                $$g.appendChildren(format.label);
                                return $$g;
                            }();
                            option.selected = me.format === format.value;
                            return option;
                        }));
                        return $$c;
                    }();
                }
            },
            {
                key: 'renderHelp',
                value: function renderHelp(item) {
                    var _this3 = this;
                    item.addEventListener('focus', function () {
                        var popper = undefined;
                        if (popper = item.querySelector('.popper')) {
                            popper.classList.remove('hidden');
                        } else {
                            var _ret = function () {
                                var postalCodeFormatData = ShippingRules.data.postalCodeFormats.filter(function (f) {
                                    return f.value === _this3.format;
                                });
                                if (!postalCodeFormatData)
                                    return { v: undefined };
                                var postalCodeFormatDatum = postalCodeFormatData[0];
                                var help = function () {
                                    var $$i = document.createElement('div');
                                    $$i.setAttribute('class', 'popper');
                                    $$i.setAttribute('tabIndex', 0);
                                    var $$j = document.createElement('div');
                                    $$j.setAttribute('class', 'postalcode-full');
                                    $$i.appendChild($$j);
                                    $$j.appendChildren(postalCodeFormatDatum.example.map(function (examplePart, index) {
                                        return function () {
                                            var $$l = document.createElement('span');
                                            $$l.setAttribute('class', 'postalcode-part');
                                            $$l.setAttribute('data-part', index + 1);
                                            $$l.setAttribute('data-type', postalCodeFormatDatum.parts[index + 1] || 'const');
                                            $$l.appendChildren(examplePart);
                                            return $$l;
                                        }();
                                    }));
                                    var $$n = document.createElement('div');
                                    $$n.setAttribute('class', 'popper__arrow');
                                    $$i.appendChild($$n);
                                    return $$i;
                                }();
                                item.querySelector('.popper-target').insertAdjacentElement('afterend', help);
                                _this3._popper = popper = new Popper(item.querySelector('.popper-target'), help, {
                                    placement: 'top',
                                    removeOnDestroy: true
                                });
                            }();
                            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === 'object')
                                return _ret.v;
                        }
                    }, true);
                    item.addEventListener('blur', function () {
                        Array.from(item.querySelectorAll('.popper')).forEach(function (popper) {
                            return popper.classList.add('hidden');
                        });
                    }, true);
                }
            },
            {
                key: 'render',
                value: function render() {
                    if (this.parent.context instanceof this.constructor)
                        return _get(Object.getPrototypeOf(_class.prototype), 'render', this).call(this);
                    var me = this;
                    if (!(ShippingRules.data && ShippingRules.data.postalCodeFormats))
                        return function () {
                            var $$o = document.createElement('li');
                            $$o.setAttribute('id', me.id);
                            var $$p = document.createTextNode('Loading...');
                            $$o.appendChild($$p);
                            return $$o;
                        }();
                    var item = function () {
                        var $$q = document.createElement('li');
                        $$q.setAttribute('id', me.id);
                        $$q.setAttribute('tabIndex', 0);
                        $$q.appendChildren(me.label);
                        var $$s = document.createTextNode(' matches the format of\n                ');
                        $$q.appendChild($$s);
                        var $$t = document.createElement('span');
                        $$t.setAttribute('class', 'popper-target');
                        $$q.appendChild($$t);
                        $$t.appendChildren(me.renderFormatDecoration());
                        $$t.appendChildren(me.renderFormatSelector());
                        var $$w = document.createElement('span');
                        $$w.setAttribute('id', me.aggregator.id);
                        $$q.appendChild($$w);
                        var $$x = document.createTextNode('\n                    and ');
                        $$w.appendChild($$x);
                        $$w.appendChildren(me.aggregator.renderCombinator());
                        var $$z = document.createTextNode(' of these conditions are ');
                        $$w.appendChild($$z);
                        $$w.appendChildren(me.aggregator.renderValue());
                        var $$bb = document.createTextNode(': ');
                        $$w.appendChild($$bb);
                        $$w.appendChildren(me.renderRemoveButton());
                        $$w.appendChildren(me.aggregator.renderChildren());
                        return $$q;
                    }();
                    this.renderHelp(item);
                    return item;
                }
            },
            {
                key: 'refresh',
                value: function refresh() {
                    var _this4 = this;
                    if (this.context instanceof this.constructor) {
                        if (this.variable in this.constructor.getVariables(this.context)) {
                            (function () {
                                var validComparators = ShippingRules.Register.comparator.getByType(_this4.type);
                                if (Object.keys(validComparators).reduce(function (accumulator, key) {
                                        return accumulator || _this4.comparator instanceof validComparators[key];
                                    }, false)) {
                                    _this4.comparator.type = _this4.type;
                                } else {
                                    var comparator = validComparators[Object.keys(validComparators)[0]];
                                    _this4.comparator = comparator ? new comparator(_this4.type) : function () {
                                        var $$ee = document.createElement('noscript');
                                        return $$ee;
                                    }();
                                }
                            }());
                        } else {
                            this.parent.removeChildByIndex(this.index);
                        }
                    } else {
                        this.aggregator.refresh();
                    }
                    if (this._popper) {
                        this._popper.destroy();
                    }
                }
            },
            {
                key: 'init',
                value: function init(obj) {
                    if (this.parent.context instanceof this.constructor)
                        return _get(Object.getPrototypeOf(_class.prototype), 'init', this).call(this, obj);
                    this.variable = obj.variable;
                    this.format = obj.value;
                    this.aggregator.init(obj.aggregator);
                }
            },
            {
                key: 'toJSON',
                value: function toJSON() {
                    var obj = _get(Object.getPrototypeOf(_class.prototype), 'toJSON', this).call(this);
                    obj.key = 'Destination_PostalCode';
                    obj.aggregator = this.aggregator;
                    obj.value = this.format || obj.value;
                    return obj;
                }
            }
        ], [
            {
                key: 'getCategory',
                value: function getCategory(context) {
                    if (context instanceof this)
                        return 'Postal Code Conditions';
                    return 'Destination Conditions';
                }
            },
            {
                key: 'getVariables',
                value: function getVariables(context) {
                    var variables = {};
                    if (!context) {
                        variables['dest_postal_code'] = {
                            label: 'Postal Code',
                            type: ['string']
                        };
                    } else if (context instanceof this && context.format) {
                        var formatData = ShippingRules.data.postalCodeFormats.filter(function (f) {
                            return f.value === context.format;
                        });
                        if (formatData.length) {
                            formatData[0].parts.forEach(function (part, index) {
                                if (part)
                                    variables[index ? 'dest_postal_code_part' + index : 'dest_postal_code_full'] = {
                                        label: index ? 'Part ' + index : 'Entire Code',
                                        type: [part === 'str' ? 'string' : 'numeric_' + part]
                                    };
                            });
                        }
                    }
                    return variables;
                }
            }
        ]);
        return _class;
    }(ShippingRules.Condition);
    ShippingRules.util.loadData('postalCodeFormats');
    ShippingRules.Register.condition.add('Destination_PostalCode', ShippingRules.Condition.PostalCode);
}(Meanbee.ShippingRules));
'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
(function (ShippingRules) {
    ShippingRules.Comparator = function () {
        function _class(type) {
            _classCallCheck(this, _class);
            this.type = type;
        }
        _createClass(_class, [
            {
                key: 'toJSON',
                value: function toJSON() {
                    return { register: 'Comparator' };
                }
            },
            {
                key: 'name',
                get: function get() {
                    return this.constructor.name(this.type);
                }
            }
        ], [
            {
                key: 'supportedTypes',
                value: function supportedTypes() {
                    return [];
                }
            },
            {
                key: 'canHandleType',
                value: function canHandleType(type) {
                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;
                    try {
                        for (var _iterator = type[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var t = _step.value;
                            if (~this.supportedTypes().indexOf(t)) {
                                return true;
                            }
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }
                    return false;
                }
            },
            {
                key: 'name',
                value: function name(type) {
                    return {};
                }
            }
        ]);
        return _class;
    }();
}(Meanbee.ShippingRules));
'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined;
        } else {
            return get(parent, property, receiver);
        }
    } else if ('value' in desc) {
        return desc.value;
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined;
        }
        return getter.call(receiver);
    }
};
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
(function (ShippingRules) {
    ShippingRules.Comparator.Between = function (_ShippingRules$Compar) {
        _inherits(_class, _ShippingRules$Compar);
        function _class(type) {
            _classCallCheck(this, _class);
            return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, type));
        }
        _createClass(_class, [
            {
                key: 'getField',
                value: function getField() {
                    var _this2 = this;
                    var type = this.type.filter(function (t) {
                        return ~_this2.constructor.supportedTypes().indexOf(t);
                    }.bind(this));
                    switch (type[0]) {
                    case 'number':
                    case 'numeric_b10':
                        return 'NumberX2';
                    case 'numeric_b26':
                        return 'NumberBase26X2';
                    case 'numeric_b36':
                        return 'NumberBase36X2';
                    default:
                        return 'TextX2';
                    }
                }
            },
            {
                key: 'toJSON',
                value: function toJSON() {
                    var obj = _get(Object.getPrototypeOf(_class.prototype), 'toJSON', this).call(this);
                    obj.key = 'Between';
                    return obj;
                }
            }
        ], [
            {
                key: 'supportedTypes',
                value: function supportedTypes() {
                    return [
                        'number',
                        'currency',
                        'numeric_b10',
                        'numeric_b26',
                        'numeric_b36',
                        'date',
                        'time',
                        'datetime'
                    ];
                }
            },
            {
                key: 'name',
                value: function name(type) {
                    var _this3 = this;
                    type = type.filter(function (t) {
                        return ~_this3.supportedTypes().indexOf(t);
                    }.bind(this));
                    switch (type[0]) {
                    default:
                        return 'IS BETWEEN';
                    }
                }
            }
        ]);
        return _class;
    }(ShippingRules.Comparator);
    ShippingRules.Register.comparator.add('Between', ShippingRules.Comparator.Between);
}(Meanbee.ShippingRules));
'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined;
        } else {
            return get(parent, property, receiver);
        }
    } else if ('value' in desc) {
        return desc.value;
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined;
        }
        return getter.call(receiver);
    }
};
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
(function (ShippingRules) {
    ShippingRules.Comparator.Equal = function (_ShippingRules$Compar) {
        _inherits(_class, _ShippingRules$Compar);
        function _class(type) {
            _classCallCheck(this, _class);
            return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, type));
        }
        _createClass(_class, [
            {
                key: 'getField',
                value: function getField() {
                    var _this2 = this;
                    var type = this.type.filter(function (t) {
                        return ~_this2.constructor.supportedTypes().indexOf(t);
                    }.bind(this));
                    switch (type[0]) {
                    case 'number':
                    case 'numeric_b10':
                        return 'Number';
                    case 'numeric_b26':
                        return 'NumberBase26';
                    case 'numeric_b36':
                        return 'NumberBase36';
                    default:
                        return 'Text';
                    }
                }
            },
            {
                key: 'toJSON',
                value: function toJSON() {
                    var obj = _get(Object.getPrototypeOf(_class.prototype), 'toJSON', this).call(this);
                    obj.key = 'Equal';
                    return obj;
                }
            }
        ], [
            {
                key: 'supportedTypes',
                value: function supportedTypes() {
                    return [
                        'number',
                        'currency',
                        'numeric_b10',
                        'numeric_b26',
                        'numeric_b36',
                        'string',
                        'enum',
                        'date',
                        'time',
                        'datetime'
                    ];
                }
            },
            {
                key: 'name',
                value: function name(type) {
                    var _this3 = this;
                    type = type.filter(function (t) {
                        return ~_this3.supportedTypes().indexOf(t);
                    }.bind(this));
                    switch (type[0]) {
                    case 'number':
                    case 'currency':
                    case 'numeric_b10':
                    case 'numeric_b26':
                    case 'numeric_b36':
                        return 'EQUALS';
                    default:
                        return 'IS';
                    }
                }
            }
        ]);
        return _class;
    }(ShippingRules.Comparator);
    ShippingRules.Register.comparator.add('Equal', ShippingRules.Comparator.Equal);
}(Meanbee.ShippingRules));
'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined;
        } else {
            return get(parent, property, receiver);
        }
    } else if ('value' in desc) {
        return desc.value;
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined;
        }
        return getter.call(receiver);
    }
};
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
(function (ShippingRules) {
    ShippingRules.Comparator.GreaterThan = function (_ShippingRules$Compar) {
        _inherits(_class, _ShippingRules$Compar);
        function _class(type) {
            _classCallCheck(this, _class);
            return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, type));
        }
        _createClass(_class, [
            {
                key: 'getField',
                value: function getField() {
                    var _this2 = this;
                    var type = this.type.filter(function (t) {
                        return ~_this2.constructor.supportedTypes().indexOf(t);
                    }.bind(this));
                    switch (type[0]) {
                    case 'number':
                    case 'numeric_b10':
                        return 'Number';
                    case 'numeric_b26':
                        return 'NumberBase26';
                    case 'numeric_b36':
                        return 'NumberBase36';
                    default:
                        return 'Text';
                    }
                }
            },
            {
                key: 'toJSON',
                value: function toJSON() {
                    var obj = _get(Object.getPrototypeOf(_class.prototype), 'toJSON', this).call(this);
                    obj.key = 'GreaterThan';
                    return obj;
                }
            }
        ], [
            {
                key: 'supportedTypes',
                value: function supportedTypes() {
                    return [
                        'number',
                        'currency',
                        'numeric_b10',
                        'numeric_b26',
                        'numeric_b36',
                        'date',
                        'time',
                        'datetime'
                    ];
                }
            },
            {
                key: 'name',
                value: function name(type) {
                    var _this3 = this;
                    type = type.filter(function (t) {
                        return ~_this3.supportedTypes().indexOf(t);
                    }.bind(this));
                    switch (type[0]) {
                    case 'numeric_b10':
                    case 'numeric_b26':
                    case 'numeric_b36':
                        return 'SUCCEEDS';
                    case 'date':
                    case 'time':
                    case 'datetime':
                        return 'IS AFTER';
                    default:
                        return 'IS GREATER THAN';
                    }
                }
            }
        ]);
        return _class;
    }(ShippingRules.Comparator);
    ShippingRules.Register.comparator.add('GreaterThan', ShippingRules.Comparator.GreaterThan);
}(Meanbee.ShippingRules));
'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined;
        } else {
            return get(parent, property, receiver);
        }
    } else if ('value' in desc) {
        return desc.value;
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined;
        }
        return getter.call(receiver);
    }
};
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
(function (ShippingRules) {
    ShippingRules.Comparator.GreaterThanOrEqual = function (_ShippingRules$Compar) {
        _inherits(_class, _ShippingRules$Compar);
        function _class(type) {
            _classCallCheck(this, _class);
            return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, type));
        }
        _createClass(_class, [
            {
                key: 'getField',
                value: function getField() {
                    var _this2 = this;
                    var type = this.type.filter(function (t) {
                        return ~_this2.constructor.supportedTypes().indexOf(t);
                    }.bind(this));
                    switch (type[0]) {
                    case 'number':
                    case 'numeric_b10':
                        return 'Number';
                    case 'numeric_b26':
                        return 'NumberBase26';
                    case 'numeric_b36':
                        return 'NumberBase36';
                    default:
                        return 'Text';
                    }
                }
            },
            {
                key: 'toJSON',
                value: function toJSON() {
                    var obj = _get(Object.getPrototypeOf(_class.prototype), 'toJSON', this).call(this);
                    obj.key = 'GreaterThanOrEqual';
                    return obj;
                }
            }
        ], [
            {
                key: 'supportedTypes',
                value: function supportedTypes() {
                    return [
                        'number',
                        'currency',
                        'numeric_b10',
                        'numeric_b26',
                        'numeric_b36',
                        'date',
                        'time',
                        'datetime'
                    ];
                }
            },
            {
                key: 'name',
                value: function name(type) {
                    var _this3 = this;
                    type = type.filter(function (t) {
                        return ~_this3.supportedTypes().indexOf(t);
                    }.bind(this));
                    switch (type[0]) {
                    case 'numeric_b10':
                    case 'numeric_b26':
                    case 'numeric_b36':
                        return 'SUCCEEDS OR EQUALS';
                    case 'date':
                    case 'time':
                    case 'datetime':
                        return 'IS AFTER (INCLUSIVE)';
                    default:
                        return 'IS GREATER THAN OR EQUALS';
                    }
                }
            }
        ]);
        return _class;
    }(ShippingRules.Comparator);
    ShippingRules.Register.comparator.add('GreaterThanOrEqual', ShippingRules.Comparator.GreaterThanOrEqual);
}(Meanbee.ShippingRules));
'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined;
        } else {
            return get(parent, property, receiver);
        }
    } else if ('value' in desc) {
        return desc.value;
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined;
        }
        return getter.call(receiver);
    }
};
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
(function (ShippingRules) {
    ShippingRules.Comparator.LessThan = function (_ShippingRules$Compar) {
        _inherits(_class, _ShippingRules$Compar);
        function _class(type) {
            _classCallCheck(this, _class);
            return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, type));
        }
        _createClass(_class, [
            {
                key: 'getField',
                value: function getField() {
                    var _this2 = this;
                    var type = this.type.filter(function (t) {
                        return ~_this2.constructor.supportedTypes().indexOf(t);
                    }.bind(this));
                    switch (type[0]) {
                    case 'number':
                    case 'numeric_b10':
                        return 'Number';
                    case 'numeric_b26':
                        return 'NumberBase26';
                    case 'numeric_b36':
                        return 'NumberBase36';
                    default:
                        return 'Text';
                    }
                }
            },
            {
                key: 'toJSON',
                value: function toJSON() {
                    var obj = _get(Object.getPrototypeOf(_class.prototype), 'toJSON', this).call(this);
                    obj.key = 'LessThan';
                    return obj;
                }
            }
        ], [
            {
                key: 'supportedTypes',
                value: function supportedTypes() {
                    return [
                        'number',
                        'currency',
                        'numeric_b10',
                        'numeric_b26',
                        'numeric_b36',
                        'date',
                        'time',
                        'datetime'
                    ];
                }
            },
            {
                key: 'name',
                value: function name(type) {
                    var _this3 = this;
                    type = type.filter(function (t) {
                        return ~_this3.supportedTypes().indexOf(t);
                    }.bind(this));
                    switch (type[0]) {
                    case 'numeric_b10':
                    case 'numeric_b26':
                    case 'numeric_b36':
                        return 'PRECEEDS';
                    case 'date':
                    case 'time':
                    case 'datetime':
                        return 'IS BEFORE';
                    default:
                        return 'IS LESS THAN';
                    }
                }
            }
        ]);
        return _class;
    }(ShippingRules.Comparator);
    ShippingRules.Register.comparator.add('LessThan', ShippingRules.Comparator.LessThan);
}(Meanbee.ShippingRules));
'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined;
        } else {
            return get(parent, property, receiver);
        }
    } else if ('value' in desc) {
        return desc.value;
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined;
        }
        return getter.call(receiver);
    }
};
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
(function (ShippingRules) {
    ShippingRules.Comparator.LessThanOrEqual = function (_ShippingRules$Compar) {
        _inherits(_class, _ShippingRules$Compar);
        function _class(type) {
            _classCallCheck(this, _class);
            return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).call(this, type));
        }
        _createClass(_class, [
            {
                key: 'getField',
                value: function getField() {
                    var _this2 = this;
                    var type = this.type.filter(function (t) {
                        return ~_this2.constructor.supportedTypes().indexOf(t);
                    }.bind(this));
                    switch (type[0]) {
                    case 'number':
                    case 'numeric_b10':
                        return 'Number';
                    case 'numeric_b26':
                        return 'NumberBase26';
                    case 'numeric_b36':
                        return 'NumberBase36';
                    default:
                        return 'Text';
                    }
                }
            },
            {
                key: 'toJSON',
                value: function toJSON() {
                    var obj = _get(Object.getPrototypeOf(_class.prototype), 'toJSON', this).call(this);
                    obj.key = 'LessThanOrEqual';
                    return obj;
                }
            }
        ], [
            {
                key: 'supportedTypes',
                value: function supportedTypes() {
                    return [
                        'number',
                        'currency',
                        'numeric_b10',
                        'numeric_b26',
                        'numeric_b36',
                        'date',
                        'time',
                        'datetime'
                    ];
                }
            },
            {
                key: 'name',
                value: function name(type) {
                    var _this3 = this;
                    type = type.filter(function (t) {
                        return ~_this3.supportedTypes().indexOf(t);
                    }.bind(this));
                    switch (type[0]) {
                    case 'numeric_b10':
                    case 'numeric_b26':
                    case 'numeric_b36':
                        return 'PRECEEDS OR EQUALS';
                    case 'date':
                    case 'time':
                    case 'datetime':
                        return 'IS BEFORE (INCLUSIVE)';
                    default:
                        return 'IS LESS THAN OR EQUALS';
                    }
                }
            }
        ]);
        return _class;
    }(ShippingRules.Comparator);
    ShippingRules.Register.comparator.add('LessThanOrEqual', ShippingRules.Comparator.LessThanOrEqual);
}(Meanbee.ShippingRules));
'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
(function (ShippingRules) {
    ShippingRules.Field = function () {
        function _class(condition, value) {
            _classCallCheck(this, _class);
            this.condition = condition;
            this.idPrefix = condition ? condition.id : function () {
                var $$a = document.createElement('noscript');
                return $$a;
            }();
            this.value = value;
        }
        _createClass(_class, [{
                key: 'valueChangeHandler',
                value: function valueChangeHandler(event) {
                    this.value = event.target.value;
                    this.condition.valueChangeHandler(this.value);
                }
            }]);
        return _class;
    }();
}(Meanbee.ShippingRules));
'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
(function (ShippingRules) {
    ShippingRules.Field.Number = function (_ShippingRules$Field) {
        _inherits(_class, _ShippingRules$Field);
        function _class() {
            _classCallCheck(this, _class);
            return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));
        }
        _createClass(_class, [{
                key: 'render',
                value: function render() {
                    var me = this;
                    return function () {
                        var $$a = document.createElement('input');
                        $$a.setAttribute('type', 'number');
                        $$a.setAttribute('id', me.idPrefix + '-value');
                        $$a.setAttribute('value', me.value);
                        $$a.addEventListener('change', me.valueChangeHandler.bind(me));
                        return $$a;
                    }();
                }
            }]);
        return _class;
    }(ShippingRules.Field);
    ShippingRules.Register.field.add('Number', ShippingRules.Field.Number);
}(Meanbee.ShippingRules));
'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined;
        } else {
            return get(parent, property, receiver);
        }
    } else if ('value' in desc) {
        return desc.value;
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined;
        }
        return getter.call(receiver);
    }
};
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
(function (ShippingRules) {
    ShippingRules.Field.NumberBase26 = function (_ShippingRules$Field) {
        _inherits(_class, _ShippingRules$Field);
        function _class() {
            _classCallCheck(this, _class);
            return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));
        }
        _createClass(_class, [
            {
                key: 'render',
                value: function render() {
                    var me = this;
                    return function () {
                        var $$a = document.createElement('input');
                        $$a.setAttribute('type', 'text');
                        $$a.setAttribute('id', me.idPrefix + '-value');
                        $$a.setAttribute('pattern', '[A-Z]');
                        $$a.setAttribute('value', me.value);
                        $$a.addEventListener('change', me.valueChangeHandler.bind(me));
                        return $$a;
                    }();
                }
            },
            {
                key: 'valueChangeHandler',
                value: function valueChangeHandler(event) {
                    event.target.value = event.target.value.toUpperCase();
                    _get(Object.getPrototypeOf(_class.prototype), 'valueChangeHandler', this).call(this);
                }
            }
        ]);
        return _class;
    }(ShippingRules.Field);
    ShippingRules.Register.field.add('NumberBase26', ShippingRules.Field.NumberBase26);
}(Meanbee.ShippingRules));
'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
(function (ShippingRules) {
    ShippingRules.Field.NumberBase26X2 = function (_ShippingRules$Field) {
        _inherits(_class, _ShippingRules$Field);
        function _class() {
            _classCallCheck(this, _class);
            return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));
        }
        _createClass(_class, [
            {
                key: 'render',
                value: function render() {
                    var me = this;
                    return function () {
                        var $$a = document.createElement('span');
                        $$a.setAttribute('id', me.idPrefix + '-value');
                        var $$b = document.createElement('input');
                        $$b.setAttribute('type', 'text');
                        $$b.setAttribute('id', me.idPrefix + '-value-0');
                        $$b.setAttribute('pattern', '[A-Z]');
                        $$b.setAttribute('value', me.value[0] || '');
                        $$b.addEventListener('change', me.valueChangeHandler.bind(me));
                        $$a.appendChild($$b);
                        var $$c = document.createTextNode('\n                and\n                ');
                        $$a.appendChild($$c);
                        var $$d = document.createElement('input');
                        $$d.setAttribute('type', 'text');
                        $$d.setAttribute('id', me.idPrefix + '-value-1');
                        $$d.setAttribute('pattern', '[A-Z]');
                        $$d.setAttribute('value', me.value[1] || '');
                        $$d.addEventListener('change', me.valueChangeHandler.bind(me));
                        $$a.appendChild($$d);
                        return $$a;
                    }();
                }
            },
            {
                key: 'valueChangeHandler',
                value: function valueChangeHandler(event) {
                    event.target.value = event.target.value.toUpperCase();
                    this.value = [
                        document.getElementById(this.idPrefix + '-value-0').value,
                        document.getElementById(this.idPrefix + '-value-1').value
                    ];
                    this.condition.valueChangeHandler(this.value);
                }
            }
        ]);
        return _class;
    }(ShippingRules.Field);
    ShippingRules.Register.field.add('NumberBase26X2', ShippingRules.Field.NumberBase26X2);
}(Meanbee.ShippingRules));
'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
var _get = function get(object, property, receiver) {
    if (object === null)
        object = Function.prototype;
    var desc = Object.getOwnPropertyDescriptor(object, property);
    if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
            return undefined;
        } else {
            return get(parent, property, receiver);
        }
    } else if ('value' in desc) {
        return desc.value;
    } else {
        var getter = desc.get;
        if (getter === undefined) {
            return undefined;
        }
        return getter.call(receiver);
    }
};
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
(function (ShippingRules) {
    ShippingRules.Field.NumberBase36 = function (_ShippingRules$Field) {
        _inherits(_class, _ShippingRules$Field);
        function _class() {
            _classCallCheck(this, _class);
            return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));
        }
        _createClass(_class, [
            {
                key: 'render',
                value: function render() {
                    var me = this;
                    return function () {
                        var $$a = document.createElement('input');
                        $$a.setAttribute('type', 'text');
                        $$a.setAttribute('id', me.idPrefix + '-value');
                        $$a.setAttribute('pattern', '[0-9A-Z]');
                        $$a.setAttribute('value', me.value);
                        $$a.addEventListener('change', me.valueChangeHandler.bind(me));
                        return $$a;
                    }();
                }
            },
            {
                key: 'valueChangeHandler',
                value: function valueChangeHandler(event) {
                    event.target.value = event.target.value.toUpperCase();
                    _get(Object.getPrototypeOf(_class.prototype), 'valueChangeHandler', this).call(this);
                }
            }
        ]);
        return _class;
    }(ShippingRules.Field);
    ShippingRules.Register.field.add('NumberBase36', ShippingRules.Field.NumberBase36);
}(Meanbee.ShippingRules));
'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
(function (ShippingRules) {
    ShippingRules.Field.NumberBase36X2 = function (_ShippingRules$Field) {
        _inherits(_class, _ShippingRules$Field);
        function _class() {
            _classCallCheck(this, _class);
            return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));
        }
        _createClass(_class, [
            {
                key: 'render',
                value: function render() {
                    var me = this;
                    return function () {
                        var $$a = document.createElement('span');
                        $$a.setAttribute('id', me.idPrefix + '-value');
                        var $$b = document.createElement('input');
                        $$b.setAttribute('type', 'text');
                        $$b.setAttribute('id', me.idPrefix + '-value-0');
                        $$b.setAttribute('pattern', '[0-9A-Z]');
                        $$b.setAttribute('value', me.value[0] || '');
                        $$b.addEventListener('change', me.valueChangeHandler.bind(me));
                        $$a.appendChild($$b);
                        var $$c = document.createTextNode('\n                and\n                ');
                        $$a.appendChild($$c);
                        var $$d = document.createElement('input');
                        $$d.setAttribute('type', 'text');
                        $$d.setAttribute('id', me.idPrefix + '-value-1');
                        $$d.setAttribute('pattern', '[0-9A-Z]');
                        $$d.setAttribute('value', me.value[1] || '');
                        $$d.addEventListener('change', me.valueChangeHandler.bind(me));
                        $$a.appendChild($$d);
                        return $$a;
                    }();
                }
            },
            {
                key: 'valueChangeHandler',
                value: function valueChangeHandler(event) {
                    event.target.value = event.target.value.toUpperCase();
                    this.value = [
                        document.getElementById(this.idPrefix + '-value-0').value,
                        document.getElementById(this.idPrefix + '-value-1').value
                    ];
                    this.condition.valueChangeHandler(this.value);
                }
            }
        ]);
        return _class;
    }(ShippingRules.Field);
    ShippingRules.Register.field.add('NumberBase36X2', ShippingRules.Field.NumberBase36X2);
}(Meanbee.ShippingRules));
'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
(function (ShippingRules) {
    ShippingRules.Field.NumberX2 = function (_ShippingRules$Field) {
        _inherits(_class, _ShippingRules$Field);
        function _class() {
            _classCallCheck(this, _class);
            return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));
        }
        _createClass(_class, [
            {
                key: 'render',
                value: function render() {
                    var me = this;
                    return function () {
                        var $$a = document.createElement('span');
                        $$a.setAttribute('id', me.idPrefix + '-value');
                        var $$b = document.createElement('input');
                        $$b.setAttribute('type', 'number');
                        $$b.setAttribute('id', me.idPrefix + '-value-0');
                        $$b.setAttribute('value', me.value[0] || '');
                        $$b.addEventListener('change', me.valueChangeHandler.bind(me));
                        $$a.appendChild($$b);
                        var $$c = document.createTextNode('\n                and\n                ');
                        $$a.appendChild($$c);
                        var $$d = document.createElement('input');
                        $$d.setAttribute('type', 'number');
                        $$d.setAttribute('id', me.idPrefix + '-value-1');
                        $$d.setAttribute('value', me.value[1] || '');
                        $$d.addEventListener('change', me.valueChangeHandler.bind(me));
                        $$a.appendChild($$d);
                        return $$a;
                    }();
                }
            },
            {
                key: 'valueChangeHandler',
                value: function valueChangeHandler(event) {
                    this.value = [
                        document.getElementById(this.idPrefix + '-value-0').value,
                        document.getElementById(this.idPrefix + '-value-1').value
                    ];
                    this.condition.valueChangeHandler(this.value);
                }
            }
        ]);
        return _class;
    }(ShippingRules.Field);
    ShippingRules.Register.field.add('NumberX2', ShippingRules.Field.NumberX2);
}(Meanbee.ShippingRules));
'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
function _possibleConstructorReturn(self, call) {
    if (!self) {
        throw new ReferenceError('this hasn\'t been initialised - super() hasn\'t been called');
    }
    return call && (typeof call === 'object' || typeof call === 'function') ? call : self;
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== 'function' && superClass !== null) {
        throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    if (superClass)
        Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
(function (ShippingRules) {
    ShippingRules.Field.Text = function (_ShippingRules$Field) {
        _inherits(_class, _ShippingRules$Field);
        function _class() {
            _classCallCheck(this, _class);
            return _possibleConstructorReturn(this, Object.getPrototypeOf(_class).apply(this, arguments));
        }
        _createClass(_class, [{
                key: 'render',
                value: function render() {
                    var me = this;
                    return function () {
                        var $$a = document.createElement('input');
                        $$a.setAttribute('type', 'text');
                        $$a.setAttribute('id', me.idPrefix + '-value');
                        $$a.setAttribute('value', me.value);
                        $$a.addEventListener('change', me.valueChangeHandler.bind(me));
                        return $$a;
                    }();
                }
            }]);
        return _class;
    }(ShippingRules.Field);
    ShippingRules.Register.field.add('Text', ShippingRules.Field.Text);
}(Meanbee.ShippingRules));
'use strict';
(function () {
    document.addEventListener('DOMContentLoaded', function () {
        var priceField = document.getElementById('price');
        priceField.hidden = true;
        var priceContainer = document.createElement('ul');
        priceContainer.classList.add('calculator-tree');
        priceField.parentElement.appendChild(priceContainer);
        window.priceCalc = new (Meanbee.ShippingRules.Register.aggregator.get('Numeric'))('priceCalculator', null, priceContainer);
        window.priceCalc.field = priceField;
        priceContainer.appendChild(window.priceCalc.render());
        var costField = document.getElementById('cost');
        costField.hidden = true;
        var costContainer = document.createElement('ul');
        costContainer.classList.add('calculator-tree');
        costField.parentElement.appendChild(costContainer);
        window.costCalc = new (Meanbee.ShippingRules.Register.aggregator.get('Numeric'))('costCalculator', null, costContainer);
        window.costCalc.field = costField;
        costContainer.appendChild(window.costCalc.render());
        var condField = document.getElementById('conditions');
        condField.hidden = true;
        var condContainer = document.createElement('ul');
        condContainer.classList.add('calculator-tree');
        condField.parentElement.appendChild(condContainer);
        window.condCalc = new (Meanbee.ShippingRules.Register.aggregator.get('Boolean'))('conditionCalculator', null, condContainer);
        window.condCalc.field = condField;
        condContainer.appendChild(window.condCalc.render());
        function changeHandler(event) {
            if (~[
                    'INPUT',
                    'SELECT'
                ].indexOf(event.target.tagName))
                Meanbee.ShippingRules.util.resizeFields();
        }
        document.body.addEventListener('change', changeHandler, false);
        document.body.addEventListener('keyup', changeHandler, false);
        Meanbee.ShippingRules.util.resizeFields();
    });
}());