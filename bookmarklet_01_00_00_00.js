// PruneBeforeClip - a bookmarklet for web clippers
//                                             Copyright (c) Seaoak 2011-2022
//                                                          https://seaoak.jp
//
//  - This program is provided under the MIT License (the X11 License)
//
(function() {

	window.prunebeforeclip = window.prunebeforeclip || {};
	var isUnfoldingMode = window.prunebeforeclip.isUnfoldingMode;
	var isAlreadyPruned = window.prunebeforeclip.isAlreadyPruned;

	var _win = window;
	var _doc = document;
	var _self = arguments.callee;

	//========================================================================

	function isFunction(x) {
		if (arguments.length !== 1) throw 'isFunction(): require exactly one argument';
		return typeof(x) === 'function';
	}

	function isNumber(x) {
		if (arguments.length !== 1) throw 'isNumber(): require exactly one argument';
		if ((typeof(x) === 'number') || ((typeof(x) === 'object') && (x instanceof Number))) {
			if (isNaN(x)) return false;
			if (! isFinite(x)) return false;
			return true;
		}
		return false;
	}

	function isInteger(x) {
		if (arguments.length !== 1) throw 'isInteger(): require exactly one argument';
		return isNumber(x) && (Math.floor(x) == x);
	}

	function isPositiveInteger(x) {
		if (arguments.length !== 1) throw 'isPositiveInteger(): require exactly one argument';
		return isInteger(x) && (x > 0);
	}

	function isNonNegativeInteger(x) {
		if (arguments.length !== 1) throw 'isNonNegativeInteger(): require exactly one argument';
		return isInteger(x) && (x >= 0);
	}

	function isArray(x) {
		if (arguments.length !== 1) throw 'isArray(): require exactly one argument';
		if (typeof(x) === 'undefined') return false;
		if (typeof(x) === 'boolean') return false;
		if (typeof(x) === 'number') return false;
		if (typeof(x) === 'string') return false;	// might be arbitrary decision
		if ((typeof(x) === 'object') || (typeof(x) === 'function')) {
			if (! x) return false;
			if (! ('length' in x)) return false;
			if (! isNonNegativeInteger(x.length)) return false;
			return true;
		}
		throw 'isArray(): unknown argument';
	}

	function isDomNode(x) {
		if (arguments.length !== 1) throw 'isDomNode(): require exactly one argument';
		if (! x) return false;
		if (! (typeof(x) === 'object')) return false;
		if (! x.nodeType) return false;
		if (! isPositiveInteger(x.nodeType)) return false;
		return true;
	}

	function isTypicalDomNode(x) {
		if (arguments.length !== 1) throw 'isTypicalDomNode(): require exactly one argument';
		if (! isDomNode(x)) return false;
		if (x.nodeType === 1) return true;	// 1: ELEMENT_NODE
		if (x.nodeType === 3) return true;	// 3: TEXT_NODE
		if (x.nodeType === 4) return true;	// 4: CDATA_SECTION_NODE
		if (x.nodeType === 8) return true;	// 8: COMMENT_NODE
		return false;
	}

	function isDocumentFlagment(x) {
		if (arguments.length !== 1) throw 'isDocumentFlagment(): require exactly one argument';
		if (! isDomNode(x)) return false;
		if (x.nodeType === 11) return true;	// 11: DOCUMENT_FRAGMENT_NODE
		return false;
	}

	//------------------------------------------------------------------------

	function arrayEach(func, list) {
		if (arguments.length !== 2) throw 'arrayEach(): require exactly two arguments';
		if (! isFunction(func)) throw 'arrayEach(): invalid argument';
		if (! isArray(list)) throw 'arrayEach(): invalid argument';
		var cache = toArray(list);
		while (cache.length) {
			func(cache.shift());
		}
	}

	function arrayMap(func, list) {
		if (arguments.length !== 2) throw 'arrayMap(): require exactly two arguments';
		if (! isFunction(func)) throw 'arrayMap(): invalid argument';
		if (! isArray(list)) throw 'arrayMap(): invalid argument';
		var cache = toArray(list);
		var result = [];
		while (cache.length) {
			result.push(func(cache.shift()));
		}
		return result;
	}

	function arrayFilter(func, list) {
		if (arguments.length !== 2) throw 'arrayFilter(): require exactly two arguments';
		if (! isFunction(func)) throw 'arrayFilter(): invalid argument';
		if (! isArray(list)) throw 'arrayFilter(): invalid argument';
		var cache = toArray(list);
		var result = [];
		while (cache.length) {
			var x = cache.shift();
			if (func(x)) result.push(x);
		}
		return result;
	}

	function arrayFlatten(list) {
		if (arguments.length !== 1) throw 'arrayFlatten(): require exactly one argument';
		if (! isArray(list)) throw 'arrayFlatten(): invalid argument';
		return Array.prototype.concat.apply([], arrayMap(function(elem) {
			return isArray(elem) ? arrayFlatten(elem) : elem;
		}, list));
	}

	function arrayNormalize(list) {
		if (arguments.length !== 1) throw 'arrayNormalize(): require exactly one argument';
		if (! isArray(list)) throw 'arrayNormalize(): invalid argument';
		return arrayFilter(myEcho, list);
	}

	function arrayEvery(func, list) {
		if (arguments.length !== 2) throw 'arrayEvery(): require exactly two arguments';
		if (! isFunction(func)) throw 'arrayEvery(): invalid argument';
		if (! isArray(list)) throw 'arrayEvery(): invalid argument';
		var cache = toArray(list);
		while (cache.length) {
			if (! func(cache.shift())) return false;	// shortcut
		}
		return true;
	}

	function arraySome(func, list) {
		if (arguments.length !== 2) throw 'arraySome(): require exactly two arguments';
		if (! isFunction(func)) throw 'arraySome(): invalid argument';
		if (! isArray(list)) throw 'arraySome(): invalid argument';
		var cache = toArray(list);
		while (cache.length) {
			if (func(cache.shift())) return true;	// shortcut
		}
		return false;
	}

	function arrayReduce(func, list, initialValue) {
		if ((arguments.length !== 2) && (arguments.length !== 3)) throw 'arrayReduce(): require two or three arguments';
		if (! isFunction(func)) throw 'arrayReduce(): invalid argument';
		if (! isArray(list)) throw 'arrayReduce(): invalid argument';
		var cache = toArray(list);
		if ((arguments.length === 2) && (cache.length === 0)) throw 'arrayReduce(): empty array with no initial value';
		var value = (arguments.length === 2) ? cache.shift() : initialValue;
		while (cache.length) {
			value = func(value, cashe.shift());
		}
		return value;
	}

	function arrayReduceRight(func, list, initialValue) {
		if ((arguments.length !== 2) && (arguments.length !== 3)) throw 'arrayReduceRight(): require two or three arguments';
		if (! isFunction(func)) throw 'arrayReduceRight(): invalid argument';
		if (! isArray(list)) throw 'arrayReduceRight(): invalid argument';
		var cache = toArray(list);
		if ((arguments.length === 2) && (cache.length === 0)) throw 'arrayReduceRight(): empty array with no initial value';
		var value = (arguments.length === 2) ? cache.pop() : initialValue;
		while (cache.length) {
			value = func(value, cashe.pop());
		}
		return value;
	}

	function toArray() {
		var result = [];
		for (var i=0; i<arguments.length; i++) {
			var x = arguments[i];
			if (isArray(x)) {
				for (var j=0; j<x.length; j++) {
					result.push(x[j]);
				}
			} else if (isDocumentFlagment(x)) {
				result.concat(toArray(x.childNodes));
			} else if (x) {
				result.push(x);
			} else {
				// skip
			}
		}
		return result;
	}

	function arrayIndexOf(elem, list, fromIndex) {
		if ((arguments.length !== 2) && (arguments.length !== 3)) throw 'arrayIndexOf(): require two or three arguments';
		if (! isArray(list)) throw 'arrayIndexOf(): invalid argument';
		var cache = toArray(list);
		var i;
		if (arguments.length === 3) {
			if (! isInteger(fromIndex)) throw 'arrayIndexOf(): invalid argument';
			if (fromIndex >= 0) {
				i = Math.min(cache.length, fromIndex);
			} else {
				i = Math.max(0, cache.length + fromIndex);	// this addition is actually subtraction
			}
		} else {
			i = 0;
		}
		while (i < cache.length) {
			if (cache[i] === elem) return i;
		}
		return -1;
	}

	function arrayIndexOf(elem, list, fromIndex) {
		if ((arguments.length !== 2) && (arguments.length !== 3)) throw 'arrayLastIndexOf(): require two or three arguments';
		if (! isArray(list)) throw 'arrayLastIndexOf(): invalid argument';
		var cache = toArray(list);
		var i;
		if (arguments.length === 3) {
			if (! isInteger(fromIndex)) throw 'arrayLastIndexOf(): invalid argument';
			if (fromIndex >= 0) {
				i = Math.min(cache.length, fromIndex + 1);
			} else {
				i = Math.max(0, cache.length + fromIndex + 1);	// this addition is actually subtraction
			}
		} else {
			i = cache.length;
		}
		while (--i >= 0) {
			if (cache[i] === elem) return i;
		}
		return -1;
	}

	//------------------------------------------------------------------------

	function myEcho(x) {
		if (arguments.length !== 1) throw 'myEcho(): require exactly one argument';
		return x;
	}

	function myNop() {
	}

	function myYield() {
		if (arguments.length === 0) throw 'myYield(): at least one argument is required';
		var args = toArray(arguments);
		var func = args.shift();
		if (! isFunction(func)) throw 'myYield(): invalid argument';
		setTimeout(function() {
			func.apply(null, args);
		}, 100);
	}

	//------------------------------------------------------------------------

	function curryEq2() {
		if (arguments.length !== 1) throw 'curryEq2(): require exactly one argument';
		var value = arguments[0];
		var f = function() {
			if (arguments.length === 0) throw 'curryEq2(): invalid argument';
			return arrayEvery(function(x) {
				return value == x;
			}, arguments);
		};
		return f;
	}

	function curryEq3() {
		if (arguments.length !== 1) throw 'curryEq3(): require exactly one argument';
		var value = arguments[0];
		var f = function() {
			if (arguments.length === 0) throw 'curryEq3(): invalid argument';
			return arrayEvery(function(x) {
				return value === x;
			}, arguments);
		};
		return f;
	}

	//------------------------------------------------------------------------

	function getElementsByClassName(dom, className) {
		if (! dom) throw 'getElementsByClassName(): invalid argument';
		if (! className) throw 'getElementsByClassName(): invalid argument';

		if (dom.nodeType) {
			var xpathQuery = "//*[contains(@class, '" + className + "')]";
			if (dom.getElementsByClassName) {
				return dom.getElementsByClassName(className);
			} else if (dom.selectNodes) {
				return dom.selectNodes(xpathQuery);
			} else if (dom.evalute && XPathResult) {
				var result = dom.evaluate(xpathQuery);
				if (! result) {
					throw 'getElementsByClassName(): evaluate() failed';
				} else if ((result.resultType == XPathResult.UNORDERED_NODE_ITERATOR_TYPE) || (result.resultType == XPathResult.ORDERED_NODE_ITERATOR_TYPE)) {
					var list = [];
					while (true) {
						var elem = result.iterateNext();
						if (! elem) break;
						list.push(elem);
					}
					return list;
				} else if ((result.resultType == XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE) || (result.resultType == XPathResult.ORDERED_NODE_SNAPSHOT_TYPE)) {
					var list = [];
					for (var i=0; i<result.snapshotLength; i++) {
						list.push(result.snapshotItem(i));
					}
					return list;
				} else if ((result.resultType == XPathResult.ANY_UNORDERED_NODE_TYPE) || (result.resultType == XPathResult.FIRST_ORDERED_NODE_TYPE)) {
					if (result.singleNodeValue) {
						return [result.singleNodeValue];
					} else {
						return [];
					}
				} else {
					throw 'getElementsByClassName(): unexpected XPath result';
				}
			} else {
				throw 'getElementsByClassName(): not supported';
			}
		} else if (isArray(dom)) {
			var regexp = new RegExp('(^|\\s)' + className + '(\\s|$)');
			return arrayFilter(function(elem) {
				return elem && elem.className && regexp.test(elem.className);
			}, dom);
		} else {
			throw 'getElementsByClassName(): invalid argument';
		}
	}

	function getElementsBySelector() {
		if (! document.querySelectorAll) throw 'getElementsBySelector(): this browser is not supported';
		return Array.prototype.concat.apply([], arrayMap(function(arg) {
			if (! arg) throw 'getElementsBySelector(): invalid argument';
			if (isDocumentFlagment(arg)) return toArray(arg);
			if (isDomNode(arg)) return [arg];
			if (typeof(arg) === 'string') return toArray(document.querySelectorAll(arg));
			throw 'getElementsBySelector(): invalid argument';
		}, arguments));
	}

	//------------------------------------------------------------------------

	function loadUrl(url, onload, onerror) {
		var iframe = document.createElement('iframe');
		iframe.style.visible = 'hidden';
		iframe.setAttribute('height', '0');
		iframe.setAttribute('width', '0');
		iframe.setAttribute('src', url);
		if (onload)  {
			iframe.onload = function(event) {
				onload(iframe);
			};
		}
		if (onerror) {
			iframe.onerror = function(event) {
				onerror(iframe);
			};
		}
		document.body.appendChild(iframe);
	}

	//========================================================================

	function removeInner() {
		arrayEach(function(target) {
			if (! target) return;
			if (isTypicalDomNode(target)) {
				if (target.nodeValue) {
					if (typeof(taret.nodeValue) !== 'string') throw 'removeInner(): unexpected nodeValue';
					target.nodeValue = '';
				}
				if (target.src) {
					if (typeof(taret.src) !== 'string') throw 'removeInner(): unexpected src';
					target.src = '';
				}
				if (target.innerHTML) target.innerHTML = '';
			} else if (isArray(target) || isDocumentFlagment(target)) {
				removeInner.apply(null, toArray(target));
			} else {
				throw 'removeInner(): invalid argument';
			}
		}, arguments);
	}

	function removeAfter(target, offset, preserveGarbage) {
		if ((arguments.length < 1) && (3 < arguments.length)) throw 'removeAfter(): the number of arguments is invalid';
		if (! target) return;
		if (arguments.length < 2) offset = 0;
		if (! isInteger(offset)) throw 'removeAfter(): invalid argument';
		if (isTypicalDomNode(target)) {
			if (! target.parentNode) return;	// already removed
			if (! preserveGarbage) removeGarbage(target.parentNode);
			if (! target.parentNode) return;	// already removed
			while (offset < 0) {
				if (! target.previousSibling) break;
				target = target.previousSibling;
				offset++;
			}
			while (offset > 0) {
				if (! target.nextSibling) break;
				target = target.nextSibling;
				offset--;
			}
			while (target.nextSibling) {
				removeAll(target.nextSibling);
			}
			return;
		}
		if (isArray(target) || isDocumentFlagment(target)) {
			arrayEach(function(elem) {
				removeAfter(elem, offset, preserveGarbage);
			}, toArray(target));
			return;
		}
		throw 'removeAfter(): invalid target';
	}

	function removeBefore(target, offset, preserveGarbage) {
		if ((arguments.length < 1) && (3 < arguments.length)) throw 'removeBefore(): the number of arguments is invalid';
		if (! target) throw 'removeBefore(): invalid argument';
		if (arguments.length < 2) offset = 0;
		if (! isInteger(offset)) throw 'removeBefore(): invalid argument';
		if (isTypicalDomNode(target)) {
			if (! target.parentNode) return;	// already removed
			if (! preserveGarbage) removeGarbage(target.parentNode);
			if (! target.parentNode) return;	// already removed
			while (offset < 0) {
				if (! target.nextSibling) break;
				target = target.nextSibling;
				offset++;
			}
			while (offset > 0) {
				if (! target.previousSibling) break;
				target = target.previousSibling;
				offset--;
			}
			while (target.previousSibling) {
				removeAll(target.previousSibling);
			}
			return;
		}
		if (isArray(target) || isDocumentFlagment(target)) {
			arrayEach(function(elem) {
				removeBefore(elem, offset, preserveGarbage);
			}, toArray(target));
			return;
		}
		throw 'removeBefore(): invalid target';
	}

	function removeAll() {
		arrayEach(function(target) {
			if (! target) return;
			if (isTypicalDomNode(target)) {
				if (! target.parentNode) return;	// already removed
				target.parentNode.removeChild(target);
				return;
			}
			if (isArray(target) || isDocumentFlagment(target)) {
				removeAll.apply(null, toArray(target));
				return;
			}
			throw 'removeAll(): invalid target';
		}, arguments);
	}

	function isGarbage(target, isStructural) {
		if (! target) {
			return false;
		} else if (! target.nodeType) {	// may be an array
			throw 'isGarbage(): invalid argument';
		} else if (target.nodeType == 8) {	// 8: Node.COMMENT_NODE
			return true;
		} else if (target.nodeType == 3) {	// 3: Node.TEXT_NODE
			if (target.parentNode.nodeName.toLowerCase().match(/^(table|colgroup|thead|tfoot|tbody|tr|ul|ol|dl|head|select|optgroup|hgroup)$/)) {
				if (! target.nodeValue.match(/^[\s\r\n]*$/)) throw 'isGarbage(): invalid HTML';
				return true;
			} else if (isStructural) {
				return true;
			} else {
				return false;
			}
		} else if (target.nodeType == 1) {	// 1: Node.ELEMENT_NODE
			return false;
		} else {
			return false;
		}
	}

	function removeGarbage(target, isStructural) {
		if (! target) {
			// do nothing
		} else if (! target.nodeType) {	// may be an array
			throw 'removeGarbage(): invalid argument';
		} else if (target.nodeType == 1) {	// 1: Node.ELEMENT_NODE
			removeAll(arrayFilter(function(e){return isGarbage(e, isStructural)}, toArray(target.childNodes)));
		} else {
			throw 'removeGarbage(): unexpected argument';
		}
	}

	function removeGarbageRecursively(target) {
		if (! target) {
			// do nothing
		} else if (! target.nodeType) {	// may be an array
			throw 'removeGarbageRecursively(): invalid argument';
		} else if (target.nodeType == 1) {	// 1: Node.ELEMENT_NODE
			removeGarbage(target);
			arrayEach(removeGarbageRecursively, toArray(target.childNodes));
		} else {
			// do nothing
		}
	}

	function removeHiddenElementRecursively(target) {
		if (! target) {
			// do nothing
		} else if (! target.nodeType) {	// should be an array
			if (! isArray(target)) throw 'removeHiddenElementRecursively(): invalid argument';
			arrayEach(arguments.callee, toArray(target));
		} else if (target.nodeType == 1) {	// 1: Node.ELEMENT_NODE
			if (target.style && ((target.style.display === 'none') || (target.style.visibility === 'hidden'))) {
				target.parentNode.removeChild(target);
			} else {
				arguments.callee(target.childNodes);
			}
		} else {
			// do nothing
		}
	}

	function isolate(dom) {
		if (! dom) throw 'isolate(): argument is null';
		if (dom === document.body) {
			// do nothing
		} else if (dom.nodeType) {
			removeBefore(dom);
			removeAfter(dom);
		} else if (isArray(dom)) {
			if (dom.length != 1) throw 'isolate(): invalid argument';
			isolate(dom[0]);
		} else {
			throw 'isolate(): invalid argument';
		}
	}

	function isolateRecursively(dom) {
		if (! dom) throw 'isolateRecursively(): argument is null';
		if (dom == document.body) {
			// do nothing
		} else if (dom.nodeType) {
			isolate(dom);
			isolateRecursively(dom.parentNode);
		} else if (isArray(dom)) {
			if (dom.length != 1) throw 'isolateRecursively(): invalid argument';
			isolateRecursively(dom[0]);
		} else {
			throw 'isolateRecursively(): invalid argument';
		}
	}

	//========================================================================

	function clearAllHandler(target) {
		var eventTypeList = [
			'afterscriptexecute',
			'abort',
			'beforeunload',
			'beforescriptexecute',
			'blur',
			'change',
			'click',
			'compositionstart',
			'compositionupdate',
			'compositionend',
			'contextmenu',
			'copy',
			'dblclick',
			'DOMActivate',
			'DOMAttributeNameChanged',
			'DOMAttrModified',
			'DOMCharacterDataModified',
			'DOMElementNameChanged',
			'DOMFocusIn',
			'DOMFocusOut',
			'DOMNodeInserted',
			'DOMNodeInsertedIntoDocument',
			'DOMNodeRemoved',
			'DOMNodeRemovedFromDocument',
			'DOMSubtreeModified',
			'error',
			'focus',
			'focusin',
			'focusout',
			'keydown',
			'keypress',
			'keyup',
			'load',
			'mousedown',
			'mouseenter',
			'mouseleave',
			'mousemove',
			'mouseout',
			'mouseover',
			'mouseup',
			'paste',
			'resize',
			'reset',
			'scroll',
			'select',
			'submit',
			'textinput',
			'unload',
			'wheel'
		];

		var eventTypeMap = {};
		arrayEach(function(e) {
			eventTypeMap[e] = true;
		}, eventTypeList);

		function clearHandler(elem) {
			if (! elem) return;
			if (! elem.attributes) return;
			arrayEach(function(attr) {
				if (! attr) return;
				var attrName = attr.nodeName;
				if (! attrName) throw 'clearHandler(): unexpected error';
				if (attrName.substring(0,2) !== 'on') return;
				if (! eventTypeMap[attrName.slice(2)]) return;
				elem.attributes.removeNamedItem(attrName);
			}, toArray(elem.attributes));
		}

		function clearHandlerRecursively(elem) {
			if (! elem) return;
			if (! elem.nodeType) return;
			if (elem.nodeType != 1) return;
			clearHandler(elem);
			arrayEach(clearHandlerRecursively, elem.childNodes);
		}

		(function() {
			var temp = target.ownerDocument.createElement(target.nodeName);
			if (! temp) throw 'clearAllHandler(): can not create a clone';
			temp.innerHTML = target.innerHTML;
			clearHandlerRecursively(temp);
			arrayEach(function(attr) {
				temp.setAttribute(attr.name, attr.value);
			}, target.attributes);
			target.parentNode.replaceChild(temp, target);
		})();
	}

	//========================================================================

	var funcList = [
		function(url, dom) {
			// normalize: CNET Japan (2011/Nov/15)
			var matching = url.match(/^(http:\/\/japan\.cnet\.com\/[^\/]+\/[^\/]+\/\d+\/)\?/);
			if (! matching) return false;
			window.location.href = matching[1];
		},
		function(url, dom) {
			// normalize: HPCwire (2011/Nov/04)
			var matching = url.match(/^(http:\/\/www\.hpcwire\.com\/hpcwire\/20\d\d-\d\d-\d\d\/[-a-zA-Z0-9_\:\.]+\.html)\?/);
			if (! matching) return false;
			window.location.href = matching[1];
		},
		function(url, dom) {
			// normalize: ITmedia オルタナティブ ブログ (2011/Oct/28)
			var matching = url.match(/^(http:\/\/blogs\.itmedia\.co\.jp\/[-a-zA-Z0-9_]+\/\d+\/\d+\/[-a-zA-Z0-9_]+\.html)\?/);
			if (! matching) return false;
			window.location.href = matching[1];
		},
		function(url, dom) {
			// normalize: MOONGIFT (2011/Nov/03)
			var matching = url.match(/^(http:\/\/)(www\.)(moongift\.jp)(\/[^?]+)(\?.+)?$/);
			if (! matching) return false;
			window.location.href = matching[1] + matching[3] + matching[4];
		},
		function(url, dom) {
			// normalize: 日本経済新聞 (2011/Oct/28)
			var matching = url.match(/^(http:\/\/www\.nikkei\.com\/news)(\/(headline|latest))?\/(related-)?(article\/g=[0-9A-Z]+)(;)?/);
			if (! matching) return false;
			if (! (matching[2] || matching[4] || matching[6])) return false;
			window.location.href = matching[1] + '/' + matching[5];
		},
		function(url, dom) {
			// normalize: Amazon.co.jp (2011/Sep/05)
			var matching = url.match(/^(http:\/\/www\.amazon\.co\.jp)(\/[^?]*)?(\/gp\/product\/(\d+X?))(\/[^?]*)?(\?.*)?$/);
			if (! matching) return false;
			window.location.href = matching[1] + '/dp/' + matching[4];
		},
		function(url, dom) {
			// normalize: Amazon.co.jp (2011/Sep/03)
			var matching = url.match(/^(http:\/\/www\.amazon\.co\.jp)(\/[^?]*)?(\/exec\/obidos)(\/[^?]*)?(\/ASIN\/(\d+X?))(\/[^?]*)?(\?.*)?$/);
			if (! matching) return false;
			window.location.href = matching[1] + '/dp/' + matching[6];
		},
		function(url, dom) {
			// normalize: Amazon.co.jp (2011/12/25)
			var matching = url.match(/^(http:\/\/www\.amazon\.co\.jp)(\/[^?]*)?(\/dp(\/product-description)?\/[0-9A-Z]+)(\/[^?]*)?(\?.*)?$/);
			if (! (matching && (matching[2] || matching[5] || matching[6]))) return false;
			window.location.href = matching[1] + matching[3];
		},
		function(url, dom) {
			// normalize: Impress Watch のニュース (2016/Jul/01)
			var matching = url.match(/^(http:\/\/(cloud|pc|dc|akiba-pc|av|game|k-tai|internet|forest|kaden|car)\.watch\.impress\.co\.jp\/[^?]+)[?].*$/);
			if (! matching) return false;
			window.location.href = matching[1];
		},
		//--------------------------------------------------------------------
		function(url, dom) {
			// CNET Japan (2011/Nov/15)
			if (! url.match(/^http:\/\/japan\.cnet\.com\/[^\/]+\/[^\/]+\/\d+\/$/)) return false;

			var targets = [];
			targets.push((function(e) {
				if (arguments.length !== 1) throw 'unexpected structure';
				if (! e) throw 'unexpected structure';
				isolate(e.parentNode);
				removeBefore(e.parentNode.parentNode);
				return e.parentNode.parentNode.parentNode;
			}).apply(null, toArray(dom.getElementsByTagName('h1'))));

			targets.push((function(e) {
				if (arguments.length !== 1) throw 'unexpected structure';
				if (! e) throw 'unexpected structure';
				removeAfter(e.parentNode);
				return e.parentNode.parentNode;
			}).apply(null, toArray(dom.getElementsByClassName('date'))));

			targets.push((function(e) {
				if (! e) throw 'unexpected structure';
				isolate(e.parentNode);
				return e.parentNode.parentNode;
			}).apply(null, toArray(dom.getElementsByTagName('newselement'))));

			arrayEach(function(e) {
				if (e.parentNode !== targets[0].parentNode) throw 'unexpected structure';
			}, targets);

			var ancestor = targets[0].parentNode;
			removeAll(arrayFilter(function(e) {
				return ! arraySome(curryEq3(e), targets);
			}, ancestor.childNodes));
			isolateRecursively(ancestor);
			return true;
		},
		function(url, dom) {
			// HPCwire (2011/Nov/04)
			if (! url.match(/^http:\/\/www\.hpcwire\.com\/hpcwire\/20\d\d-\d\d-\d\d\/[-a-zA-Z0-9_\:\.]+\.html$/)) return false;
			var target = dom.getElementById('bodytext');
			if (! target) return false;
			removeAfter(target);
			isolateRecursively(target.parentNode);
			return true;
		},
		function(url, dom) {
			// Yahoo! ニュース (2011/Oct/20)
			if (! url.match(/^http:\/\/zasshi\.news\.yahoo\.co\.jp\/article\?a=[-a-zA-Z0-9_]+$/)) return false;
			var target = dom.getElementById('ynDetail');
			isolateRecursively(target);
			removeGarbage(target);
			removeAfter(getElementsByClassName(target, 'ynLastEditDate')[0]);
			var subtarget = (function(e) {
				while (e) {
					if ((e.nodeType == 3) && (e.nodeValue == '\n【関連記事】')) return e;
					e = e.previousSibling;
				}
				return undefined;
			})(getElementsByClassName(target, 'ymuiContainerNopad')[1].lastChild);
			if (subtarget) removeAfter(subtarget, -1);
			return true;
		},
		function(url, dom) {
			// 日本経済新聞 (2011/Oct/20)
			if (! url.match(/^http:\/\/www\.nikkei\.com\/news\/article\/g=[0-9A-Z]+$/)) return false;
			var targetCandidates = getElementsByClassName(dom, 'cmnc-publish');
			if (! targetCandidates) return false;
			if (targetCandidates.length != 1) return false;
			if (! targetCandidates[0]) return false;
			if (! targetCandidates[0].parentNode) return false;
			var target = targetCandidates[0].parentNode.parentNode;
			if (! target) return false;
			removeGarbage(target.parentNode);
			removeBefore(target.previousSibling);
			removeAfter(target);
			isolateRecursively(target.parentNode);
			removeAll(target.getElementsByTagName('form'));
			removeAll(getElementsByClassName(target, 'cmn-article_keyword'));
			return true;
		},
		function(url, dom) {
			// はてなダイアリー (2011/Oct/20)
			if (! url.match(/^http:\/\/d\.hatena\.ne\.jp\/[-a-zA-Z0-9_]+\/\d+(\/[-a-zA-Z0-9_]+|#\d+)?$/)) return false;
			var target = dom.getElementsByClassName('section')[0];
			isolate(target);
			removeAfter(target.parentNode); // class="body"
			isolateRecursively(target.parentNode.parentNode);   // class="day"
			removeAll(target.getElementsByClassName('hatena-star-comment-container'));
			removeAll(target.getElementsByClassName('hatena-star-star-container'));
			removeAll(target.getElementsByClassName('addBookmarkLink'));
			removeAll(target.getElementsByClassName('share-button'));
			removeAll(target.getElementsByClassName('sectionfooter'));
			removeAll(target.getElementsByClassName('bookmark-icon'));
			removeAll(target.getElementsByClassName('bookmark-count'));
			return true;
		},
		function(url, dom) {
			// Touch Lab (2011/Sep/05)
			if (! url.match(/^http:\/\/ipodtouchlab\.com\/\d+\/\d+\/[-_\w]+\.html$/)) return false;

			var title = dom.getElementsByTagName('title')[0];
			if (title && (title.parentNode.nodeName.toLowerCase() != 'head')) {
				// なぜか title 要素が body 要素の中に置かれているので修正
				removeAll(title);
				dom.getElementsByTagName('head')[0].appendChild(title);
			}

			var target = dom.getElementById('main');
			if (! target) throw 'unexpected structure';
			isolateRecursively(target);

			removeBefore(target.getElementsByTagName('h2')[0]);
			removeAfter(dom.getElementById('more'));

			return true;
		},
		function(url, dom) {
			// Amazon.co.jp (2011/Sep/03)
			if (! url.match(/^http:\/\/www\.amazon\.co\.jp\/dp\/\d+X?$/)) return false;

			var image = dom.getElementById('prodImage');
			var title = dom.getElementsByTagName('h1')[0].parentNode;
			var price = dom.getElementById('priceBlock');
			var desc = dom.getElementById('productDescription');
			var list = (function() {
				var target = dom.getElementById('SalesRank');
				var parent = target.parentNode;
				removeAfter(target, -2);
				return parent;
			})();

			isolateRecursively(title);
			title.parentNode.appendChild(price);
			title.parentNode.appendChild(image);
			title.parentNode.appendChild(list);
			title.parentNode.appendChild(desc);

			dom.title = dom.title.replace(/^Amazon\.co\.jp[:：][\s　]+/, '');

			removeAll(dom.getElementsByTagName('link'));
			removeAll(dom.getElementsByTagName('script'));
			removeAll(dom.getElementsByTagName('noscript'));

			return true;
		},
		function(url, dom) {
			// 東京新聞 (2011/May/19)
			if (! url.match(/^http:\/\/www\.tokyo-np\.co\.jp\/[a-z]\/article\/\d+\.html$/)) return false;
			var target = getElementsByClassName(dom, 'News-textarea')[0];
			isolateRecursively(target.parentNode);
			removeBefore(target, 1);
			removeAll(getElementsByClassName(target, 'print'));
			return true;
		},
		function(url, dom) {
			// ウォール・ストリート・ジャーナル 日本版 (20111/May/14)
			if (! url.match(/^http:\/\/jp\.wsj\.com\/[^/]+\/.+$/)) return false;
			var target = getElementsByClassName(dom, 'home-wrap')[0];
			isolateRecursively(target);
			removeGarbage(target);
			(function(elem) {
				isolate(elem);
				if (target != elem.parentNode.parentNode) throw 'ERROR';
			})(getElementsByClassName(dom, 'articleHeadlineBox')[0]);
			(function(elem) {
				removeBefore(elem);
				removeAfter(elem, 1);
				isolate(elem.parentNode);
				if (target != elem.parentNode.parentNode.parentNode) throw 'ERROR';
			})(dom.getElementById('article_story_body'));
			if (target.childNodes.length != 4) throw 'ERROR';
			removeAll(target.childNodes[3]);
			removeAll(target.childNodes[1]);
			return true;
		},
		function(url, dom) {
			// 時事ドットコム (2011/May/14)
			if (! url.match(/^http:\/\/www\.jiji\.com\/jc\/[^/]+$/)) return false;
			var target = dom.getElementById('article-area');
			isolateRecursively(target);
			return true;
		},
		function(url, dom) {
			// ライフハッカー (2011/May/28)
			if (! url.match(/^http:\/\/www\.lifehacker\.jp\/\d+\/\d+\/[^/]+\.html$/)) return false;
			var target = dom.getElementById('entry_detail');
			isolateRecursively(target);
			(function(elem) {
				removeGarbage(elem);
				removeAfter(elem.firstChild);
			})(getElementsByClassName(target, 'entry_data')[0]);
			removeAll(getElementsByClassName(target, 'cat'));
			removeAll(getElementsByClassName(target, 'ad_entry_title_under'));
			removeAll(getElementsByClassName(target, 'EntryMoreBanner'));
			removeAll(getElementsByClassName(target, 'amazon_ranking'));
			removeAfter(getElementsByClassName(target, 'recententries')[0], -1);
			return true;
		},
		function(url, dom) {
			// ギズモード・ジャパン GIZMODO JAPAN (2011/May/13)
			if (! url.match(/^http:\/\/www\.gizmodo\.jp\/\d+\/\d+\/[^/]+\.html$/)) return false;
			var target = dom.getElementById('entry_detail');
			isolateRecursively(target);
			(function(elem) {
				removeGarbage(elem);
				removeAfter(elem.firstChild);
			})(getElementsByClassName(target, 'entry_data')[0]);
			removeAll(getElementsByClassName(target, 'ad_entry_title_under'));
			(function(elem) {
				// 最初の div 以降をすべて削除
				while (elem) {
					if (elem.nodeName.toLowerCase() == 'div') {
						removeAfter(elem, -1);
						break;
					}
					elem = elem.nextSibling;
				}
			})(getElementsByClassName(target, 'entry_body')[0].firstChild);
			return true;
		},
		function(url, dom) {
			// MOONGIFT (2011/Nov/03)
			if (! url.match(/^http:\/\/moongift\.jp\/(r\/)?\d+\/\d+\/(\d+(-\d+)?|[-a-zA-Z0-9_]+)\/$/)) return false;
			var target = getElementsByClassName(dom, 'main')[0];
			isolateRecursively(target);
			removeAfter(getElementsByClassName(target, 'title'));
			removeAfter(getElementsByClassName(target, 'post_body'));
			removeAll(arrayMap(function(elem) {
				return elem.parentNode.parentNode;
			}, arrayFilter(function(elem) {
				return elem.href == 'http://www.moongift.jp/moongift_premium/';
			}, arrayFlatten(arrayMap(function(elem) {
				return toArray(elem.getElementsByTagName('a'));
			}, toArray(getElementsByClassName(target, 'post_body')))))));
			removeAfter(getElementsByClassName(target, 'social'), -1);
			return true;
		},
		function(url, dom) {
			// YOMIURI ONLINE (2011/May/10)
			if (! url.match(/^http:\/\/www\.yomiuri\.co\.jp\/.+\/\d+-\w+\.htm(\?.+)?$/)) return false;
			var target = getElementsByClassName(dom, 'article-def')[0];
			isolateRecursively(target);
			removeAll(getElementsByClassName(target, 'sbtns'));
			removeAfter(getElementsByClassName(target, 'date-def'));
			return true;
		},
		function(url, dom) {
			// GIGAZINE (2011/May/09)
			if (! url.match(/^http:\/\/gigazine\.net\/news\/[^/]+\/$/)) return false;
			var target = getElementsByClassName(dom, 'article')[0].parentNode;
			isolateRecursively(target);
			removeBefore(getElementsByClassName(target, 'date'));
			removeAfter(getElementsByClassName(target, 'article'));
			arrayEach(function(elem) {
				if (elem.parentNode && (elem.innerHTML == '・関連記事')) removeAfter(elem, -1, true);
			}, toArray(target.getElementsByTagName('b')));
			return true;
		},
		function(url, dom) {
			// TechCrunch JAPAN (2011/May/07)
			if (! url.match(/^http:\/\/jp\.techcrunch\.com\/archives\/[^/]+\/$/)) return false;
			var target = getElementsByClassName(dom, 'entry')[0];
			isolateRecursively(target.parentNode);
			isolate(getElementsByClassName(dom, 'post_subheader_left'));
			return true;
		},
		function(url, dom) {
			// ロケットニュース24 (2011/May/07)
			if (! url.match(/^http:\/\/rocketnews24\.com\/(\?p=\d+|\d+\/\d+\/\d+\/\d+\/)$/)) return false;
			var target = getElementsByClassName(dom, 'post-content')[0];
			isolateRecursively(target.parentNode);
			removeAfter(target);
			removeAll(getElementsByClassName(dom, 'ad'));
			removeAll(getElementsByClassName(dom, 'act'));
			removeAll(getElementsByClassName(dom, 'social-btn'));
			return true;
		},
		function(url, dom) {
			// asahi.com (2011/May/01)
			if (! url.match(/^http:\/\/www\.asahi\.com\/\w+\/\w+\/(\d+\/)?\w+\.html$/)) return false;
			isolateRecursively(dom.getElementById('HeadLine'));
			removeAll(dom.getElementById('utility_right'));
			return true;
		},
		function(url, dom) {
			// ガジェット通信 (2011/May/01)
			if (! url.match(/^http:\/\/getnews\.jp\/archives\/\d+$/)) return false;
			isolateRecursively(getElementsByClassName(dom, 'post')[0]);
			removeAll(dom.getElementById('adingoBeagle1'));
			(function(target) {
				removeGarbage(target);
				removeAll(target.firstChild);
				removeAll(target.firstChild);
				removeAfter(dom.getElementById('bookmark_single'), -1);
				if (arrayFilter(function(elem) {
					return (elem.nodeType == 3) && (elem.nodeValue == '関連記事リンク');
				}, target.lastChild.childNodes)) {
					target.removeChild(target.lastChild);
				}
			})(getElementsByClassName(dom, 'post-bodycopy')[0]);
			removeAfter(getElementsByClassName(dom, 'pagebar')[0], -2);
			return true;
		},
		function(url, dom) {
			// engadget 日本語版 (2011/Apr/30)
			if (! url.match(/^http:\/\/japanese\.engadget\.com\/\d+\/\d+\/\d+\/[^/]+\/$/)) return false;
			var target = getElementsByClassName(dom, 'post')[0];
			isolateRecursively(target);
			removeAll(getElementsByClassName(target, 'postmeta'));
			return true;
		},
		function(url, dom) {
			// 4Gamer.net (2011/Oct/25)
			if (! url.match(/^http:\/\/www\.4gamer\.net\/games\/\d+\/\w+\/\d+\/$/)) return false;
			var target = getElementsByClassName(dom, 'maintxt')[0];
			isolate(target);
			isolateRecursively(target.parentNode.parentNode);
			removeGarbage(target.parentNode.parentNode, true);
			removeBefore(target.parentNode.previousSibling);
			removeAfter(target.parentNode);
			removeGarbage(target.parentNode.previousSibling, true);
			removeBefore(target.parentNode.previousSibling.lastChild.previousSibling);
			return true;
		},
		function(url, dom) {
			// ＠IT のニュース記事 (2011/Apr/29)
			if (! url.match(/^http:\/\/www\.atmarkit\.co\.jp\/news\/\d+\/\d+\/.+\.html$/)) return false;
			var breadcrumb = dom.getElementById('navibar'); // おぼえておく
			var target = dom.getElementById('centercol');
			isolateRecursively(target);
			target.parentNode.insertBefore(breadcrumb, target);
			removeGarbage(target);
			removeAll(dom.getElementById('headmenu-area'));
			removeAll(dom.getElementById('credit').previousSibling);
			removeAfter(dom.getElementById('credit'));
			return true;
		},
		function(url, dom) {
			// ＠IT の解説記事 (2011/Oct/28)
			if (! url.match(/^http:\/\/www\.atmarkit\.co\.jp\/fwin2k\/.+\.html$/)) return false;
			var target = dom.getElementById('centercol');
			isolateRecursively(target);
			removeGarbage(target);
			removeAll(dom.getElementById('headmenu-area'));
			arrayEach(function(elem) {
				if (elem.getAttribute('alt') == 'End of Article') {
					while (elem.parentNode != target) {
						elem = elem.parentNode;
					}
					removeAfter(elem);
				}
			}, toArray(dom.getElementsByTagName('img')));
			return true;
		},
		function(url, dom) {
			// 47NEWS (2011/Apr/26)
			if (! url.match(/^http:\/\/www\.47news\.jp\/CN\/\d+\/CN\d+\.html$/)) return false;
			var elem = dom.getElementById('bt_body').parentNode;
			removeAll(getElementsByClassName(dom, 'snsBox'));
			isolateRecursively(elem.parentNode);
			return true;
		},
		function(url, dom) {
			// Publickey (2011/Apr/25)
			if (! url.match(/^http:\/\/www\.publickey1\.jp\/blog\/.+$/)) return false;
			var target = dom.getElementById('maincol');
			isolateRecursively(target);
			removeGarbage(target);
			removeAfter(getElementsByClassName(target, 'recommends'), -4);
			removeAfter(target.getElementsByTagName('h4')[0], -1);
			return true;
		},
		function(url, dom) {
			// Business Media 誠 (2011/May/01)
			if (! url.match(/^http:\/\/bizmakoto\.jp\/makoto\/articles\/.+$/)) return false;
			arrayEach(function(elem) {
				removeGarbage(elem.parentNode);
				if ((! elem.nextSibling) && (elem.id == 'end')) removeAll(elem);
			}, toArray(getElementsByClassName(dom, 'ctrl')));
			if (isUnfoldingMode && (getElementsByClassName(dom, 'ctrl').length > 0)) {
				var ctrlDom = getElementsByClassName(dom, 'ctrl')[0];
				removeGarbage(ctrlDom.parentNode);
				removeGarbage(ctrlDom);
				var isBackwarding = ! ! ctrlDom.nextSibling;
				var url = (function() {
					// ページ先頭の ctrl 要素か、ページ末尾の ctrl 要素かで、参照するリンクを変える
					var parent = isBackwarding ? ctrlDom.firstChild : ctrlDom.lastChild;
					var elem = parent.getElementsByTagName('a')[0];
					if (! elem) throw 'unexpected structure (A)';
					return elem.href;
				})();
				loadUrl(url, function(iframe) {
					removeAll(iframe.contentDocument.getElementById('notice'));
					var target = iframe.contentDocument.getElementById('tmplBody');
					if (! target) throw 'unexpected content';
					removeGarbage(target);
					if (target.childNodes.length != 1) throw 'unexpected content';
					target = target.firstChild;
					removeGarbage(target);
					(function() {
						var newCtrlDom = isBackwarding ? target.lastChild : target.firstChild;
						if (! newCtrlDom.className.match(/\bctrl\b/)) throw 'unexpected structure (B)';
						removeAll(newCtrlDom);
					})();
					arrayEach(function(elem) {
						if ((elem.id == 'start') || (elem.id == 'end')) removeAll(elem);
					}, toArray(getElementsByClassName(target, 'ctrl')));
					arrayEach(function(elem) {
						ctrlDom.parentNode.insertBefore(elem.parentNode.removeChild(elem), ctrlDom);
					}, toArray(target.childNodes));
					iframe.parentNode.removeChild(iframe);
					removeAll(ctrlDom);
					myYield(_self);
				}, function(iframe) {
					throw 'can not load next page: ' + url;
				});
				removeAll(dom.getElementById('notice'));
				return undefined;
			}
			isolateRecursively(dom.getElementById('tmplMain').parentNode);
			removeAll(getElementsByClassName(dom, 'navi'));
			removeAll(dom.getElementById('masterSocialbuttonTop'));
			removeAll(dom.getElementById('masterSocialbuttonMid'));
			isolate(dom.getElementById('tmplBody'));
			removeAfter(dom.getElementById('masterSocialbuttonBtm'), -2);
			return true;
		},
		function(url, dom) {
			// ITmedia オルタナティブ ブログ (2011/Oct/28)
			if (! url.match(/^http:\/\/blogs\.itmedia\.co\.jp\/[-a-zA-Z0-9_]+\/\d+\/\d+\/[-a-zA-Z0-9_]+\.html$/)) return false;
			var target = document.getElementsByClassName('entryBox')[0];
			isolateRecursively(target);
			removeAll(getElementsByClassName(target, 'entryBox-toolbar'));
			removeAfter(getElementsByClassName(target, 'entryBox-body')[0]);
			return true;
		},
		function(url, dom) {
			// ITmedia ガジェット (2011/May/07)
			if (true &&
				(! url.match(/^http:\/\/gadget\.itmedia\.co\.jp\/gg\/articles\/.+$/))) return false;
			var target = dom.getElementById('tmplNewsIn');
			isolateRecursively(target);
			removeBefore(dom.getElementById('cmsType'));
			removeAfter(dom.getElementById('cmsBody'));
			removeAll(dom.getElementById('masterSocialbuttonBtm'));
			removeAfter(dom.getElementById('cmsCopyright'));
			removeBefore(dom.getElementById('lnk'), 1);
			removeAll(getElementsByClassName(dom, 'adsense'));
			return true;
		},
		function(url, dom) {
			// ITmedia プロモバ (2011/Nov/04)
			if (! url.match(/^http:\/\/www\.itmedia\.co\.jp\/(promobile)\/articles\/\d\d\d\d\/\d\d\/news\d\d\d\.html$/)) return false;
			var target = dom.getElementById('article_body');
			if (! target) return false;
			isolateRecursively(target.parentNode.parentNode);
			removeAll(dom.getElementById('masterSocialbuttonTop'));
			removeAfter(target.parentNode);
			removeAfter(getElementsByClassName(target, 'endkwd'), -1);
			removeAfter(getElementsByClassName(target, 'endlink'), -1);
			return true;
		},
		function(url, dom) {
			// ITmedia ニュース (2011/Nov/04)
			// ITmedia エンタープライズ (2011/Nov/04)
			if (! url.match(/^http:\/\/www\.itmedia\.co\.jp\/(news|enterprise)\/articles\/\d\d\d\d\/\d\d\/news\d\d\d\.html$/)) return false;
			var target = dom.getElementById('tmplNewsIn');
			if (! target) return false;
			isolateRecursively(target);
			removeBefore(dom.getElementById('cmsDate'));
			removeAll(dom.getElementById('cmsByline'));
			removeAll(dom.getElementById('masterSocialbuttonTop'));
			var target2 = dom.getElementById('cmsBody');
			removeAfter(target2);
			isolate(getElementsByClassName(target2, 'inner'));
			removeBefore(dom.getElementById('cmsMark'), -1);
			removeAfter(dom.getElementById('amazon-item'), -1);
			removeAfter(getElementsByClassName(target2, 'endkwd'), -1);
			removeAfter(getElementsByClassName(target2, 'cmsBox'), -1);
			removeAfter(dom.getElementById('AuthorProfile'), -1);
			removeAfter(dom.getElementById('facebookLikebox'), -1);
			removeAfter(getElementsByClassName(target2, 'endlink'), -1);
			return true;
		},
		function(url, dom) {
			// ITmedia ねとらぼ (2013/Aug/03) ※「新着記事一覧」のみを削除
			if (! url.match(/^http:\/\/nlab\.itmedia\.co\.jp\/nl\/articles\/\d\d\d\d\/\d\d\/news\d\d\d\.html$/)) return false;
			var candidates = dom.getElementsByTagName('small');
			var targets = arrayMap(function(elem) {
				if (elem.parentNode.nodeName.toLowerCase() !== 'li') return null;
				if (elem.parentNode.parentNode.nodeName.toLowerCase() !== 'ul') return null;
				console.log(elem);
				return elem.parentNode;
			}, candidates);
			removeAll(targets)
			return true;
		},
		function(url, dom) {
			// ITmedia +D PC USER (2011/May/05)
			// ITmedia +D Mobile (2013/Aug/03)
			// ITmedia +D LifeStyle (2011/Nov/04)
			if (! url.match(/^http:\/\/(plusd|www)\.itmedia\.co\.jp\/(pcuser|mobile|lifestyle)\/articles\/\d\d\d\d\/\d\d\/news\d\d\d(_\d)?.html$/)) return false;
			removeAfter(dom.getElementById('notice'), -1);
			removeAfter(getElementsByClassName(dom, 'endlink'), -1);
			removeAfter(getElementsByClassName(dom, 'endkwd'), -1);
			return true;
		},
		function(url, dom) {
			// EE Times Japan (2013/Aug/03)
			if (! url.match(/^http:\/\/eetimes\.jp\/ee\/articles\/.+$/)) return false;
			removeAfter([dom.getElementById('notice')], -1);
			removeAfter(getElementsByClassName(dom, 'endlink'), -1);
			removeAfter(getElementsByClassName(dom, 'endkwd'), -1);
			return true;
		},
		function(url, dom) {
			// Wired Vision (2011/Apr/25)
			if (! url.match(/^http:\/\/wiredvision\.jp\/news\/.+$/)) return false;
			var target = dom.getElementById('entry');
			isolateRecursively(target);
			removeGarbage(target);
			isolate(getElementsByClassName(target, 'pageInfoContent'));
			removeAll(dom.getElementById('textAdInEntry'));
			removeAll(dom.getElementById('entryUtility'));
			isolate(dom.getElementById('entryBody'));
			removeAll(dom.getElementById('entryContent').nextSibling);
			return true;
		},
		function(url, dom) {
			// Vector の新着ソフトレビュー (2011/Apr/24)
			if (! url.match(/^http:\/\/www\.vector\.co\.jp\/magazine\/softnews\/.+$/)) return false;
			var target = dom.getElementById('v_wrapper');
			isolateRecursively(target);
			removeGarbage(target);
			removeAll(target.firstChild);
			removeAll(target.firstChild);
			removeAll(target.firstChild);
			removeAll(target.firstChild);
			removeAll(target.firstChild);
			while (target.childNodes.length > 4) {
				removeAll(target.lastChild);
			}
			target = target.lastChild;
			if (target.nodeName.toLowerCase() != 'table') throw 'unexpected structure';
			removeGarbage(target);
			target = target.firstChild;
			if (target.nodeName.toLowerCase() != 'tbody') throw 'unexpected structure';
			removeGarbage(target);
			target = target.firstChild;
			if (target.nodeName.toLowerCase() != 'tr') throw 'unexpected structure';
			removeGarbage(target);
			if (target.childNodes.length != 2) throw 'unexpected structure';
			target = target.firstChild;
			isolate(target);
			removeGarbage(target);
			removeAll(target.lastChild);
			removeAll(target.lastChild);
			removeAll(target.lastChild);
			removeAll(target.lastChild);
			return true;
		},
		function(url, dom) {
			// Impress Watch のニュース (2016/Jul/01)
			if (! url.match(/^http:\/\/(cloud|pc|dc|akiba-pc|av|game|k-tai|internet|forest|kaden|car)\.watch\.impress\.co\.jp\/docs\/(news|event|serial|review|column|series|topic|special|mreview|sp)\/.+$/)) return false;
			isolateRecursively(getElementsByClassName(dom, 'contents'));
			removeAll(getElementsByClassName(dom, 'social_bookmark'));
			removeAll(getElementsByClassName(dom, 'social-bookmark'));
			removeAll(dom.getElementById('extra'));
			removeAll(getElementsByClassName(dom, 'btn'));
			removeAll(getElementsByClassName(dom, 'author-detail'));
			removeAll(getElementsByClassName(dom, 'amazon-aff'));
			removeAll(getElementsByClassName(dom, 'aff_wf'));
			return true;
		},
		function(url, dom) {
			// Impress Watch のニュース (2016/Jul/01)
			if (! url.match(/^http:\/\/(akiba-pc)\.watch\.impress\.co\.jp\/docs\/(price)\/.+$/)) return false;
			isolateRecursively(getElementsByClassName(dom, 'main-contents'));
			removeAll(getElementsByClassName(dom, 'social_bookmark'));
			removeAll(getElementsByClassName(dom, 'social-bookmark'));
			removeAll(dom.getElementById('extra'));
			removeAll(getElementsByClassName(dom, 'btn'));
			removeAll(getElementsByClassName(dom, 'author-detail'));
			removeAll(getElementsByClassName(dom, 'amazon-aff'));
			removeAll(getElementsByClassName(dom, 'aff_wf'));
			return true;
		},
		function(url, dom) {
			// ロイター (2011/May/14)
			if (! url.match(/^http:\/\/jp\.reuters\.com\/article[\/]/)) return false;
			var target = getElementsByClassName(dom, 'article')[0];
			isolateRecursively(target);
			removeGarbage(target);
			arrayEach(function(elem) {
				if (elem.nodeName.toLowerCase() == 'h1') return;
				if (elem.className.match(/\btimestampHeader\b/)) return;
				if (elem.id == 'resizeableText') return;
				removeAll(elem);
			}, toArray(target.childNodes));
			removeAll(dom.getElementById('relatedNews'));
			return true;
		},
		function(url, dom) {
			// マイコミジャーナル (2011/Apr/24)
			if (! url.match(/^http:\/\/journal\.mycom\.co\.jp\/.+\/(index\.html|\d+\.html)?$/)) return false;
			isolateRecursively(dom.getElementById('articleMain'));
			removeAll(dom.getElementById('socialBookmarkList'));
			removeAll(getElementsByClassName(dom, 'textAdBlock'));
			removeAfter(getElementsByClassName(dom, 'articleContent'));
			return true;
		},
		function(url, dom) {
			// ITpro (2013/Aug/03)
			if (! url.match(/^http:\/\/itpro\.nikkeibp\.co\.jp\/article\/NEWS\/\d+\/\d+\/$/)) return false;
			var target = dom.getElementById('kijiBox');
			isolateRecursively(target);
			return true;
		}
	];

	//========================================================================

	removeGarbageRecursively(document.body);

	var is_completed = (function() {
		if (window['ppw'] && ppw['bookmarklet']) {	// PrintWhatYouLike.com
			return undefined;
		}
		if (isAlreadyPruned) {
			return undefined;
		}
		for (var i=0; i<funcList.length; i++) {
			var isCompleted = funcList[i].call(null, window.location.href, document);
			if (isCompleted) {
				return true;
			}
			if (isCompleted === undefined) {
				throw 'to be continued!';
			}
		}
		return false;
	})();

	removeHiddenElementRecursively(document.body)
	removeAll(document.getElementsByTagName('script'));
	removeAll(document.getElementsByTagName('iframe'));
	removeAll(document.getElementsByTagName('object'));
	removeAll(document.getElementsByTagName('embed'));
	removeAll(document.getElementsByTagName('video'));
	clearAllHandler(document.body);

	if (is_completed === undefined) {
		alert('[PruneBeforeClip] Garbages are removed.');
	} else if (is_completed) {
		alert('[PruneBeforeClip] Completed.');
	} else {
		alert('[PruneBeforeClip] Sorry, this page is not supported yet.');
	}

	window.prunebeforeclip.isAlreadyPruned = true;
})();
