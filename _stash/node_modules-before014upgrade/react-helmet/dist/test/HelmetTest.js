var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

/* eslint max-nested-callbacks: [1, 5] */

var _reactAddons = require("react/addons");

var _reactAddons2 = _interopRequireDefault(_reactAddons);

var _index = require("../index");

var _index2 = _interopRequireDefault(_index);

var _Helmet = require("../Helmet");

var HELMET_ATTRIBUTE = "data-react-helmet";

describe("Helmet", function () {
    var headElement;

    var container = document.createElement("div");

    beforeEach(function () {
        headElement = headElement || document.head || document.querySelector("head");
    });

    afterEach(function () {
        _reactAddons2["default"].unmountComponentAtNode(container);
    });

    describe("api", function () {
        describe("title", function () {
            it("can update page title", function () {
                _reactAddons2["default"].render(_reactAddons2["default"].createElement(_index2["default"], { title: "Test Title" }), container);

                expect(document.title).to.equal("Test Title");
            });

            it("can update page title with multiple children", function () {
                _reactAddons2["default"].render(_reactAddons2["default"].createElement(
                    "div",
                    null,
                    _reactAddons2["default"].createElement(_index2["default"], { title: "Test Title" }),
                    _reactAddons2["default"].createElement(_index2["default"], { title: "Child One Title" }),
                    _reactAddons2["default"].createElement(_index2["default"], { title: "Child Two Title" })
                ), container);

                expect(document.title).to.equal("Child Two Title");
            });

            it("will set title based on deepest nested component", function () {
                _reactAddons2["default"].render(_reactAddons2["default"].createElement(
                    "div",
                    null,
                    _reactAddons2["default"].createElement(_index2["default"], { title: "Main Title" }),
                    _reactAddons2["default"].createElement(_index2["default"], { title: "Nested Title" })
                ), container);

                expect(document.title).to.equal("Nested Title");
            });

            it("will set title using deepest nested component with a defined title", function () {
                _reactAddons2["default"].render(_reactAddons2["default"].createElement(
                    "div",
                    null,
                    _reactAddons2["default"].createElement(_index2["default"], { title: "Main Title" }),
                    _reactAddons2["default"].createElement(_index2["default"], null)
                ), container);

                expect(document.title).to.equal("Main Title");
            });

            it("will use a titleTemplate if defined", function () {
                _reactAddons2["default"].render(_reactAddons2["default"].createElement(_index2["default"], {
                    title: "Test",
                    titleTemplate: "This is a %s of the titleTemplate feature"
                }), container);

                expect(document.title).to.equal("This is a Test of the titleTemplate feature");
            });

            it("will replace multiple title strings in titleTemplate", function () {
                _reactAddons2["default"].render(_reactAddons2["default"].createElement(_index2["default"], {
                    title: "Test",
                    titleTemplate: "This is a %s of the titleTemplate feature. Another %s."
                }), container);

                expect(document.title).to.equal("This is a Test of the titleTemplate feature. Another Test.");
            });

            it("will use a titleTemplate based on deepest nested component", function () {
                _reactAddons2["default"].render(_reactAddons2["default"].createElement(
                    "div",
                    null,
                    _reactAddons2["default"].createElement(_index2["default"], {
                        title: "Test",
                        titleTemplate: "This is a %s of the titleTemplate feature"
                    }),
                    _reactAddons2["default"].createElement(_index2["default"], {
                        title: "Second Test",
                        titleTemplate: "A %s using nested titleTemplate attributes"
                    })
                ), container);

                expect(document.title).to.equal("A Second Test using nested titleTemplate attributes");
            });

            it("will merge deepest component title with nearest upstream titleTemplate", function () {
                _reactAddons2["default"].render(_reactAddons2["default"].createElement(
                    "div",
                    null,
                    _reactAddons2["default"].createElement(_index2["default"], {
                        title: "Test",
                        titleTemplate: "This is a %s of the titleTemplate feature"
                    }),
                    _reactAddons2["default"].createElement(_index2["default"], { title: "Second Test" })
                ), container);

                expect(document.title).to.equal("This is a Second Test of the titleTemplate feature");
            });
        });

        describe("meta tags", function () {
            it("can update meta tags", function () {
                _reactAddons2["default"].render(_reactAddons2["default"].createElement(_index2["default"], {
                    meta: [{ "charset": "utf-8" }, { "name": "description", "content": "Test description" }, { "http-equiv": "content-type", "content": "text/html" }, { "property": "og:type", "content": "article" }]
                }), container);

                var existingTags = headElement.querySelectorAll("meta[" + HELMET_ATTRIBUTE + "]");

                expect(existingTags).to.not.equal(undefined);

                var filteredTags = [].slice.call(existingTags).filter(function (tag) {
                    return Object.is(tag.getAttribute("charset"), "utf-8") || Object.is(tag.getAttribute("name"), "description") && Object.is(tag.getAttribute("content"), "Test description") || Object.is(tag.getAttribute("http-equiv"), "content-type") && Object.is(tag.getAttribute("content"), "text/html");
                });

                expect(filteredTags.length).to.be.at.least(3);
            });

            it("will clear all meta tags if none are specified", function () {
                _reactAddons2["default"].render(_reactAddons2["default"].createElement(_index2["default"], null), container);

                var existingTags = headElement.querySelectorAll("meta[" + HELMET_ATTRIBUTE + "]");

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
            });

            it("tags without 'name', 'http-equiv', 'property', or 'charset' will not be accepted", function () {
                _reactAddons2["default"].render(_reactAddons2["default"].createElement(_index2["default"], {
                    meta: ["content", "won't work"]
                }), container);

                var existingTags = headElement.querySelectorAll("meta[" + HELMET_ATTRIBUTE + "]");

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
            });

            it("will set meta tags based on deepest nested component", function () {
                _reactAddons2["default"].render(_reactAddons2["default"].createElement(
                    "div",
                    null,
                    _reactAddons2["default"].createElement(_index2["default"], {
                        meta: [{ "charset": "utf-8" }, { "name": "description", "content": "Test description" }]
                    }),
                    _reactAddons2["default"].createElement(_index2["default"], {
                        meta: [{ "name": "description", "content": "Inner description" }, { "name": "keywords", "content": "test,meta,tags" }]
                    })
                ), container);

                var existingTags = headElement.querySelectorAll("meta[" + HELMET_ATTRIBUTE + "]");

                var _existingTags = _slicedToArray(existingTags, 3);

                var firstTag = _existingTags[0];
                var secondTag = _existingTags[1];
                var thirdTag = _existingTags[2];

                expect(existingTags).to.not.equal(undefined);

                expect(existingTags.length).to.be.equal(3);

                expect(existingTags).to.have.deep.property("[0]").that.is.an["instanceof"](Element);
                expect(firstTag).to.have.property("getAttribute");
                expect(firstTag.getAttribute("charset")).to.equal("utf-8");
                expect(firstTag.outerHTML).to.equal("<meta charset=\"utf-8\" " + HELMET_ATTRIBUTE + "=\"true\">");

                expect(existingTags).to.have.deep.property("[1]").that.is.an["instanceof"](Element);
                expect(secondTag).to.have.property("getAttribute");
                expect(secondTag.getAttribute("name")).to.equal("description");
                expect(secondTag.getAttribute("content")).to.equal("Inner description");
                expect(secondTag.outerHTML).to.equal("<meta name=\"description\" content=\"Inner description\" " + HELMET_ATTRIBUTE + "=\"true\">");

                expect(existingTags).to.have.deep.property("[2]").that.is.an["instanceof"](Element);
                expect(thirdTag).to.have.property("getAttribute");
                expect(thirdTag.getAttribute("name")).to.equal("keywords");
                expect(thirdTag.getAttribute("content")).to.equal("test,meta,tags");
                expect(thirdTag.outerHTML).to.equal("<meta name=\"keywords\" content=\"test,meta,tags\" " + HELMET_ATTRIBUTE + "=\"true\">");
            });

            it("will allow duplicate meta tags if specified in the same component", function () {
                _reactAddons2["default"].render(_reactAddons2["default"].createElement(_index2["default"], {
                    meta: [{ "name": "description", "content": "Test description" }, { "name": "description", "content": "Duplicate description" }]
                }), container);

                var existingTags = headElement.querySelectorAll("meta[" + HELMET_ATTRIBUTE + "]");

                var _existingTags2 = _slicedToArray(existingTags, 2);

                var firstTag = _existingTags2[0];
                var secondTag = _existingTags2[1];

                expect(existingTags).to.not.equal(undefined);

                expect(existingTags.length).to.equal(2);

                expect(existingTags).to.have.deep.property("[0]").that.is.an["instanceof"](Element);
                expect(firstTag).to.have.property("getAttribute");
                expect(firstTag.getAttribute("name")).to.equal("description");
                expect(firstTag.getAttribute("content")).to.equal("Test description");
                expect(firstTag.outerHTML).to.equal("<meta name=\"description\" content=\"Test description\" " + HELMET_ATTRIBUTE + "=\"true\">");

                expect(existingTags).to.have.deep.property("[1]").that.is.an["instanceof"](Element);
                expect(secondTag).to.have.property("getAttribute");
                expect(secondTag.getAttribute("name")).to.equal("description");
                expect(secondTag.getAttribute("content")).to.equal("Duplicate description");
                expect(secondTag.outerHTML).to.equal("<meta name=\"description\" content=\"Duplicate description\" " + HELMET_ATTRIBUTE + "=\"true\">");
            });

            it("will override duplicate meta tags with single meta tag in a nested component", function () {
                _reactAddons2["default"].render(_reactAddons2["default"].createElement(
                    "div",
                    null,
                    _reactAddons2["default"].createElement(_index2["default"], {
                        meta: [{ "name": "description", "content": "Test description" }, { "name": "description", "content": "Duplicate description" }]
                    }),
                    _reactAddons2["default"].createElement(_index2["default"], {
                        meta: [{ "name": "description", "content": "Inner description" }]
                    })
                ), container);

                var existingTags = headElement.querySelectorAll("meta[" + HELMET_ATTRIBUTE + "]");

                var _existingTags3 = _slicedToArray(existingTags, 1);

                var firstTag = _existingTags3[0];

                expect(existingTags).to.not.equal(undefined);

                expect(existingTags.length).to.equal(1);

                expect(existingTags).to.have.deep.property("[0]").that.is.an["instanceof"](Element);
                expect(firstTag).to.have.property("getAttribute");
                expect(firstTag.getAttribute("name")).to.equal("description");
                expect(firstTag.getAttribute("content")).to.equal("Inner description");
                expect(firstTag.outerHTML).to.equal("<meta name=\"description\" content=\"Inner description\" " + HELMET_ATTRIBUTE + "=\"true\">");
            });

            it("will override single meta tag with duplicate meta tags in a nested component", function () {
                _reactAddons2["default"].render(_reactAddons2["default"].createElement(
                    "div",
                    null,
                    _reactAddons2["default"].createElement(_index2["default"], {
                        meta: [{ "name": "description", "content": "Test description" }]
                    }),
                    _reactAddons2["default"].createElement(_index2["default"], {
                        meta: [{ "name": "description", "content": "Inner description" }, { "name": "description", "content": "Inner duplicate description" }]
                    })
                ), container);

                var existingTags = headElement.querySelectorAll("meta[" + HELMET_ATTRIBUTE + "]");

                var _existingTags4 = _slicedToArray(existingTags, 2);

                var firstTag = _existingTags4[0];
                var secondTag = _existingTags4[1];

                expect(existingTags).to.not.equal(undefined);

                expect(existingTags.length).to.equal(2);

                expect(existingTags).to.have.deep.property("[0]").that.is.an["instanceof"](Element);
                expect(firstTag).to.have.property("getAttribute");
                expect(firstTag.getAttribute("name")).to.equal("description");
                expect(firstTag.getAttribute("content")).to.equal("Inner description");
                expect(firstTag.outerHTML).to.equal("<meta name=\"description\" content=\"Inner description\" " + HELMET_ATTRIBUTE + "=\"true\">");

                expect(existingTags).to.have.deep.property("[1]").that.is.an["instanceof"](Element);
                expect(secondTag).to.have.property("getAttribute");
                expect(secondTag.getAttribute("name")).to.equal("description");
                expect(secondTag.getAttribute("content")).to.equal("Inner duplicate description");
                expect(secondTag.outerHTML).to.equal("<meta name=\"description\" content=\"Inner duplicate description\" " + HELMET_ATTRIBUTE + "=\"true\">");
            });
        });

        describe("link tags", function () {
            it("can update link tags", function () {
                _reactAddons2["default"].render(_reactAddons2["default"].createElement(_index2["default"], {
                    link: [{ "href": "http://localhost/helmet", "rel": "canonical" }, { "href": "http://localhost/style.css", "rel": "stylesheet", "type": "text/css" }]
                }), container);

                var existingTags = headElement.getElementsByTagName("link");

                expect(existingTags).to.not.equal(undefined);

                var filteredTags = [].slice.call(existingTags).filter(function (tag) {
                    return Object.is(tag.getAttribute("href"), "http://localhost/style.css") && Object.is(tag.getAttribute("rel"), "stylesheet") && Object.is(tag.getAttribute("type"), "text/css") || Object.is(tag.getAttribute("href"), "http://localhost/helmet") && Object.is(tag.getAttribute("rel"), "canonical");
                });

                expect(filteredTags.length).to.be.at.least(2);
            });

            it("will clear all link tags if none are specified", function () {
                _reactAddons2["default"].render(_reactAddons2["default"].createElement(_index2["default"], null), container);

                var existingTags = headElement.querySelectorAll("link[" + HELMET_ATTRIBUTE + "]");

                expect(existingTags).to.not.equal(undefined);
                expect(existingTags.length).to.equal(0);
            });

            it("will set link tags based on deepest nested component", function () {
                _reactAddons2["default"].render(_reactAddons2["default"].createElement(
                    "div",
                    null,
                    _reactAddons2["default"].createElement(_index2["default"], {
                        link: [{ "rel": "canonical", "href": "http://localhost/helmet" }, { "href": "http://localhost/style.css", "rel": "stylesheet", "type": "text/css", "media": "all" }]
                    }),
                    _reactAddons2["default"].createElement(_index2["default"], {
                        link: [{ "rel": "canonical", "href": "http://localhost/helmet/innercomponent" }, { "href": "http://localhost/inner.css", "rel": "stylesheet", "type": "text/css", "media": "all" }]
                    })
                ), container);

                var existingTags = headElement.querySelectorAll("link[" + HELMET_ATTRIBUTE + "]");

                var _existingTags5 = _slicedToArray(existingTags, 3);

                var firstTag = _existingTags5[0];
                var secondTag = _existingTags5[1];
                var thirdTag = _existingTags5[2];

                expect(existingTags).to.not.equal(undefined);

                expect(existingTags.length).to.be.at.least(2);

                expect(existingTags).to.have.deep.property("[0]").that.is.an["instanceof"](Element);
                expect(firstTag).to.have.property("getAttribute");
                expect(firstTag.getAttribute("href")).to.equal("http://localhost/style.css");
                expect(firstTag.getAttribute("rel")).to.equal("stylesheet");
                expect(firstTag.getAttribute("type")).to.equal("text/css");
                expect(firstTag.getAttribute("media")).to.equal("all");
                expect(firstTag.outerHTML).to.equal("<link href=\"http://localhost/style.css\" rel=\"stylesheet\" type=\"text/css\" media=\"all\" " + HELMET_ATTRIBUTE + "=\"true\">");

                expect(existingTags).to.have.deep.property("[1]").that.is.an["instanceof"](Element);
                expect(secondTag).to.have.property("getAttribute");
                expect(secondTag.getAttribute("href")).to.equal("http://localhost/helmet/innercomponent");
                expect(secondTag.getAttribute("rel")).to.equal("canonical");
                expect(secondTag.outerHTML).to.equal("<link rel=\"canonical\" href=\"http://localhost/helmet/innercomponent\" " + HELMET_ATTRIBUTE + "=\"true\">");

                expect(existingTags).to.have.deep.property("[2]").that.is.an["instanceof"](Element);
                expect(thirdTag).to.have.property("getAttribute");
                expect(thirdTag.getAttribute("href")).to.equal("http://localhost/inner.css");
                expect(thirdTag.getAttribute("rel")).to.equal("stylesheet");
                expect(thirdTag.getAttribute("type")).to.equal("text/css");
                expect(thirdTag.getAttribute("media")).to.equal("all");
                expect(thirdTag.outerHTML).to.equal("<link href=\"http://localhost/inner.css\" rel=\"stylesheet\" type=\"text/css\" media=\"all\" " + HELMET_ATTRIBUTE + "=\"true\">");
            });

            it("will allow duplicate link tags if specified in the same component", function () {
                _reactAddons2["default"].render(_reactAddons2["default"].createElement(_index2["default"], {
                    link: [{ "rel": "canonical", "href": "http://localhost/helmet" }, { "rel": "canonical", "href": "http://localhost/helmet/component" }]
                }), container);

                var existingTags = headElement.querySelectorAll("link[" + HELMET_ATTRIBUTE + "]");

                var _existingTags6 = _slicedToArray(existingTags, 2);

                var firstTag = _existingTags6[0];
                var secondTag = _existingTags6[1];

                expect(existingTags).to.not.equal(undefined);

                expect(existingTags.length).to.be.at.least(2);

                expect(existingTags).to.have.deep.property("[0]").that.is.an["instanceof"](Element);
                expect(firstTag).to.have.property("getAttribute");
                expect(firstTag.getAttribute("rel")).to.equal("canonical");
                expect(firstTag.getAttribute("href")).to.equal("http://localhost/helmet");
                expect(firstTag.outerHTML).to.equal("<link rel=\"canonical\" href=\"http://localhost/helmet\" " + HELMET_ATTRIBUTE + "=\"true\">");

                expect(existingTags).to.have.deep.property("[1]").that.is.an["instanceof"](Element);
                expect(secondTag).to.have.property("getAttribute");
                expect(secondTag.getAttribute("rel")).to.equal("canonical");
                expect(secondTag.getAttribute("href")).to.equal("http://localhost/helmet/component");
                expect(secondTag.outerHTML).to.equal("<link rel=\"canonical\" href=\"http://localhost/helmet/component\" " + HELMET_ATTRIBUTE + "=\"true\">");
            });

            it("will override duplicate link tags with a single link tag in a nested component", function () {
                _reactAddons2["default"].render(_reactAddons2["default"].createElement(
                    "div",
                    null,
                    _reactAddons2["default"].createElement(_index2["default"], {
                        link: [{ "rel": "canonical", "href": "http://localhost/helmet" }, { "rel": "canonical", "href": "http://localhost/helmet/component" }]
                    }),
                    _reactAddons2["default"].createElement(_index2["default"], {
                        link: [{ "rel": "canonical", "href": "http://localhost/helmet/innercomponent" }]
                    })
                ), container);

                var existingTags = headElement.querySelectorAll("link[" + HELMET_ATTRIBUTE + "]");

                var _existingTags7 = _slicedToArray(existingTags, 1);

                var firstTag = _existingTags7[0];

                expect(existingTags).to.not.equal(undefined);

                expect(existingTags.length).to.be.equal(1);

                expect(existingTags).to.have.deep.property("[0]").that.is.an["instanceof"](Element);
                expect(firstTag).to.have.property("getAttribute");
                expect(firstTag.getAttribute("rel")).to.equal("canonical");
                expect(firstTag.getAttribute("href")).to.equal("http://localhost/helmet/innercomponent");
                expect(firstTag.outerHTML).to.equal("<link rel=\"canonical\" href=\"http://localhost/helmet/innercomponent\" " + HELMET_ATTRIBUTE + "=\"true\">");
            });

            it("will override single link tag with duplicate link tags in a nested component", function () {
                _reactAddons2["default"].render(_reactAddons2["default"].createElement(
                    "div",
                    null,
                    _reactAddons2["default"].createElement(_index2["default"], {
                        link: [{ "rel": "canonical", "href": "http://localhost/helmet" }]
                    }),
                    _reactAddons2["default"].createElement(_index2["default"], {
                        link: [{ "rel": "canonical", "href": "http://localhost/helmet/component" }, { "rel": "canonical", "href": "http://localhost/helmet/innercomponent" }]
                    })
                ), container);

                var existingTags = headElement.querySelectorAll("link[" + HELMET_ATTRIBUTE + "]");

                var _existingTags8 = _slicedToArray(existingTags, 2);

                var firstTag = _existingTags8[0];
                var secondTag = _existingTags8[1];

                expect(existingTags).to.not.equal(undefined);

                expect(existingTags.length).to.be.equal(2);

                expect(existingTags).to.have.deep.property("[0]").that.is.an["instanceof"](Element);
                expect(firstTag).to.have.property("getAttribute");
                expect(firstTag.getAttribute("rel")).to.equal("canonical");
                expect(firstTag.getAttribute("href")).to.equal("http://localhost/helmet/component");
                expect(firstTag.outerHTML).to.equal("<link rel=\"canonical\" href=\"http://localhost/helmet/component\" " + HELMET_ATTRIBUTE + "=\"true\">");

                expect(existingTags).to.have.deep.property("[1]").that.is.an["instanceof"](Element);
                expect(secondTag).to.have.property("getAttribute");
                expect(secondTag.getAttribute("rel")).to.equal("canonical");
                expect(secondTag.getAttribute("href")).to.equal("http://localhost/helmet/innercomponent");
                expect(secondTag.outerHTML).to.equal("<link rel=\"canonical\" href=\"http://localhost/helmet/innercomponent\" " + HELMET_ATTRIBUTE + "=\"true\">");
            });
        });
    });

    describe("misc", function () {
        it("throws in rewind() when a DOM is present", function () {
            _reactAddons2["default"].render(_reactAddons2["default"].createElement(_index2["default"], {
                title: "Fancy title"
            }), container);

            expect(_index2["default"].rewind).to["throw"]("You may ony call rewind() on the server. Call peek() to read the current state.");
        });

        it("lets you read current state in peek() whether or not a DOM is present", function () {
            _reactAddons2["default"].render(_reactAddons2["default"].createElement(_index2["default"], {
                title: "Fancy title"
            }), container);

            expect(_index2["default"].peek().title).to.be.equal("Fancy title");
            _index2["default"].canUseDOM = false;
            expect(_index2["default"].peek().title).to.be.equal("Fancy title");
            _index2["default"].canUseDOM = true;
        });

        it("will html encode string", function () {
            _reactAddons2["default"].render(_reactAddons2["default"].createElement(_index2["default"], {
                meta: [{ "name": "description", "content": "This is \"quoted\" text and & and '." }]
            }), container);

            var existingTags = headElement.querySelectorAll("meta[" + HELMET_ATTRIBUTE + "]");
            var existingTag = existingTags[0];

            expect(existingTags).to.not.equal(undefined);

            expect(existingTags.length).to.be.equal(1);

            expect(existingTags).to.have.deep.property("[0]").that.is.an["instanceof"](Element);
            expect(existingTag).to.have.property("getAttribute");
            expect(existingTag.getAttribute("name")).to.equal("description");
            expect(existingTag.getAttribute("content")).to.equal("This is \"quoted\" text and & and '.");
            expect(existingTag.outerHTML).to.equal("<meta name=\"description\" content=\"This is &quot;quoted&quot; text and &amp; and '.\" " + HELMET_ATTRIBUTE + "=\"true\">");
        });

        it("will html encode title on server", function () {
            _index2["default"].canUseDOM = false;

            _reactAddons2["default"].render(_reactAddons2["default"].createElement(_index2["default"], {
                title: "Dangerous <script> include"
            }), container);

            var head = _index2["default"].rewind();

            expect(head.title).to.be.equal("Dangerous &#x3C;script&#x3E; include");

            _index2["default"].canUseDOM = true;
        });

        it("will not update the DOM if updated props are unchanged", function (done) {
            var old = _Helmet.HelmetComponent.onDOMChange;
            var changesToDOM = 0;
            _Helmet.HelmetComponent.onDOMChange = function (state) {
                changesToDOM++;
                return old(state);
            };

            _reactAddons2["default"].render(_reactAddons2["default"].createElement(_index2["default"], {
                title: "Test Title",
                meta: [{ "name": "description", "content": "Test description" }]
            }), container);

            // Re-rendering will pass new props to an already mounted Helmet
            _reactAddons2["default"].render(_reactAddons2["default"].createElement(_index2["default"], {
                title: "Test Title",
                meta: [{ "name": "description", "content": "Test description" }]
            }), container);

            setTimeout(function () {
                expect(changesToDOM).to.equal(1);
                _Helmet.HelmetComponent.onDOMChange = old;
                done();
            }, 1000);
        });

        it("will not update the DOM when nested Helmets have props that are identical", function (done) {
            var old = _Helmet.HelmetComponent.onDOMChange;
            var changesToDOM = 0;
            _Helmet.HelmetComponent.onDOMChange = function (state) {
                changesToDOM++;
                return old(state);
            };

            _reactAddons2["default"].render(_reactAddons2["default"].createElement(
                _index2["default"],
                {
                    title: "Test Title",
                    meta: [{ "name": "description", "content": "Test description" }]
                },
                _reactAddons2["default"].createElement(
                    "div",
                    null,
                    _reactAddons2["default"].createElement(_index2["default"], {
                        title: "Test Title",
                        meta: [{ "name": "description", "content": "Test description" }]
                    })
                )
            ), container);

            setTimeout(function () {
                expect(changesToDOM).to.equal(1);
                _Helmet.HelmetComponent.onDOMChange = old;
                done();
            }, 1000);
        });
    });
});