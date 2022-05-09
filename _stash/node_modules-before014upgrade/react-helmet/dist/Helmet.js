Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _reactSideEffect = require("react-side-effect");

var _reactSideEffect2 = _interopRequireDefault(_reactSideEffect);

var _deepEqual = require("deep-equal");

var _deepEqual2 = _interopRequireDefault(_deepEqual);

var _HelmetConstantsJs = require("./HelmetConstants.js");

var _he = require("he");

var _he2 = _interopRequireDefault(_he);

var _warning = require("warning");

var _warning2 = _interopRequireDefault(_warning);

var HELMET_ATTRIBUTE = "data-react-helmet";

var getInnermostProperty = function getInnermostProperty(propsList, property) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = [].concat(_toConsumableArray(propsList)).reverse()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var props = _step.value;

            if (props[property]) {
                return props[property];
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
                _iterator["return"]();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return null;
};

var getTitleFromPropsList = function getTitleFromPropsList(propsList) {
    var innermostTitle = getInnermostProperty(propsList, "title");
    var innermostTemplate = getInnermostProperty(propsList, "titleTemplate");

    if (innermostTemplate && innermostTitle) {
        return innermostTemplate.replace(/\%s/g, innermostTitle);
    }

    return innermostTitle || "";
};

var getTagsFromPropsList = function getTagsFromPropsList(tagName, uniqueTagIds, propsList) {
    // Calculate list of tags, giving priority innermost component (end of the propslist)
    var approvedSeenTags = new Map();
    var validTags = Object.keys(_HelmetConstantsJs.TAG_PROPERTIES).map(function (key) {
        return _HelmetConstantsJs.TAG_PROPERTIES[key];
    });

    var tagList = propsList.filter(function (props) {
        return !Object.is(typeof props[tagName], "undefined");
    }).map(function (props) {
        return props[tagName];
    }).reverse().reduce(function (approvedTags, instanceTags) {
        var instanceSeenTags = new Map();

        instanceTags.filter(function (tag) {
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = Object.keys(tag)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var attributeKey = _step2.value;

                    var lowerCaseAttributeKey = attributeKey.toLowerCase();
                    var value = tag[attributeKey].toLowerCase();

                    if (Object.is(validTags.indexOf(lowerCaseAttributeKey), -1)) {
                        return false;
                    }

                    if (!approvedSeenTags.has(lowerCaseAttributeKey)) {
                        approvedSeenTags.set(lowerCaseAttributeKey, new Set());
                    }

                    if (!instanceSeenTags.has(lowerCaseAttributeKey)) {
                        instanceSeenTags.set(lowerCaseAttributeKey, new Set());
                    }

                    if (!approvedSeenTags.get(lowerCaseAttributeKey).has(value)) {
                        instanceSeenTags.get(lowerCaseAttributeKey).add(value);
                        return true;
                    }

                    return false;
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                        _iterator2["return"]();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }
        }).reverse().forEach(function (tag) {
            return approvedTags.push(tag);
        });

        // Update seen tags with tags from this instance
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = instanceSeenTags.keys()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var attributeKey = _step3.value;

                var tagUnion = new Set([].concat(_toConsumableArray(approvedSeenTags.get(attributeKey)), _toConsumableArray(instanceSeenTags.get(attributeKey))));

                approvedSeenTags.set(attributeKey, tagUnion);
            }
        } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
                    _iterator3["return"]();
                }
            } finally {
                if (_didIteratorError3) {
                    throw _iteratorError3;
                }
            }
        }

        instanceSeenTags.clear();
        return approvedTags;
    }, []);

    return tagList;
};

var updateTitle = function updateTitle(title) {
    document.title = title || document.title;
};

var updateTags = function updateTags(type, tags) {
    var headElement = document.head || document.querySelector("head");
    var existingTags = headElement.querySelectorAll(type + "[" + HELMET_ATTRIBUTE + "]");

    // Remove any tags previously injected by Helmet
    Array.forEach(existingTags, function (tag) {
        return tag.parentNode.removeChild(tag);
    });

    if (tags && tags.length) {
        tags.forEach(function (tag) {
            var newElement = document.createElement(type);

            for (var attribute in tag) {
                if (tag.hasOwnProperty(attribute)) {
                    newElement.setAttribute(attribute, tag[attribute]);
                }
            }

            newElement.setAttribute(HELMET_ATTRIBUTE, "true");
            headElement.insertBefore(newElement, headElement.firstChild);
        });
    }
};

var generateTagsAsString = function generateTagsAsString(type, tags) {
    var html = tags.map(function (tag) {
        var attributeHtml = Object.keys(tag).map(function (attribute) {
            var encodedValue = _he2["default"].encode(tag[attribute], {
                useNamedReferences: true
            });
            return attribute + "=\"" + encodedValue + "\"";
        }).join(" ");

        return "<" + type + " " + attributeHtml + " " + HELMET_ATTRIBUTE + "=\"true\" />";
    });

    return html.join("\n");
};

var Helmet = (function (_React$Component) {
    _inherits(Helmet, _React$Component);

    function Helmet() {
        _classCallCheck(this, Helmet);

        _get(Object.getPrototypeOf(Helmet.prototype), "constructor", this).apply(this, arguments);
    }

    _createClass(Helmet, [{
        key: "shouldComponentUpdate",
        value: function shouldComponentUpdate(nextProps) {
            return !(0, _deepEqual2["default"])(this.props, nextProps);
        }
    }, {
        key: "render",
        value: function render() {
            var childCount = _react2["default"].Children.count(this.props.children);
            (0, _warning2["default"])(Object.is(childCount, 0), "Helmet components should be stand-alone and not contain any children.");

            if (Object.is(childCount, 1)) {
                return _react2["default"].Children.only(this.props.children);
            } else if (childCount > 1) {
                return _react2["default"].createElement(
                    "span",
                    null,
                    this.props.children
                );
            }

            return null;
        }
    }], [{
        key: "onDOMChange",
        value: function onDOMChange(newState) {
            return newState;
        }
    }, {
        key: "propTypes",

        /**
         * @param {Object} title: "Title"
         * @param {Object} meta: [{"name": "description", "content": "Test description"}]
         * @param {Object} link: [{"rel": "canonical", "href": "http://mysite.com/example"}]
         */
        value: {
            title: _react2["default"].PropTypes.string,
            titleTemplate: _react2["default"].PropTypes.string,
            meta: _react2["default"].PropTypes.arrayOf(_react2["default"].PropTypes.object),
            link: _react2["default"].PropTypes.arrayOf(_react2["default"].PropTypes.object),
            children: _react2["default"].PropTypes.oneOfType([_react2["default"].PropTypes.object, _react2["default"].PropTypes.array])
        },
        enumerable: true
    }]);

    return Helmet;
})(_react2["default"].Component);

var reducePropsToState = function reducePropsToState(propsList) {
    return {
        title: getTitleFromPropsList(propsList),
        metaTags: getTagsFromPropsList(_HelmetConstantsJs.TAG_NAMES.META, [_HelmetConstantsJs.TAG_PROPERTIES.NAME, _HelmetConstantsJs.TAG_PROPERTIES.CHARSET, _HelmetConstantsJs.TAG_PROPERTIES.HTTPEQUIV], propsList),
        linkTags: getTagsFromPropsList(_HelmetConstantsJs.TAG_NAMES.LINK, [_HelmetConstantsJs.TAG_PROPERTIES.REL, _HelmetConstantsJs.TAG_PROPERTIES.HREF], propsList)
    };
};

var clientState = undefined;
var handleClientStateChange = function handleClientStateChange(newState) {
    if ((0, _deepEqual2["default"])(clientState, newState)) {
        return;
    }

    var title = newState.title;
    var metaTags = newState.metaTags;
    var linkTags = newState.linkTags;

    updateTitle(title);
    updateTags(_HelmetConstantsJs.TAG_NAMES.LINK, linkTags);
    updateTags(_HelmetConstantsJs.TAG_NAMES.META, metaTags);

    Helmet.onDOMChange(newState);

    // Caching state in order to check if client state should be updated
    clientState = newState;
};

var mapStateOnServer = function mapStateOnServer(_ref) {
    var title = _ref.title;
    var metaTags = _ref.metaTags;
    var linkTags = _ref.linkTags;
    return {
        title: _he2["default"].encode(title),
        meta: generateTagsAsString(_HelmetConstantsJs.TAG_NAMES.META, metaTags),
        link: generateTagsAsString(_HelmetConstantsJs.TAG_NAMES.LINK, linkTags)
    };
};

exports.HelmetComponent = Helmet;
exports["default"] = (0, _reactSideEffect2["default"])(reducePropsToState, handleClientStateChange, mapStateOnServer)(Helmet);