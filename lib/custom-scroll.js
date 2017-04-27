"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var ReactDOM = require("react-dom");
var CustomScrollBar = (function (_super) {
    __extends(CustomScrollBar, _super);
    function CustomScrollBar() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.state = {
            scrollPos: 0,
            onDrag: false
        };
        _this.scrollbarYWidth = 0;
        _this.contentHeight = 0;
        _this.visibleHeight = 0;
        _this.scrollRatio = 0;
        _this.scrollHandleHeight = 0;
        _this.hasScroll = true;
        _this.startDragHandlePos = 0;
        _this.startDragMousePos = 0;
        _this.touchStart = 0;
        _this.showHandle = false;
        _this.updateOnStartTimeoutToken = null;
        _this.position = {
            top: 0,
            left: 0
        };
        _this.onCustomScrollClick = function (event) {
            if (_this.isClickOnScrollHandle(event)) {
                return;
            }
            var newScrollHandleTop = _this.calculateNewScrollHandleTop(event);
            var newScrollValue = _this.getScrollValueFromHandlePosition(newScrollHandleTop);
            _this.updateScrollPosition(newScrollValue);
        };
        _this.onHandleDrag = function (event) {
            event.preventDefault();
            var mouseDeltaY = event.pageY - _this.startDragMousePos;
            var handleTopPosition = _this.ensureWithinLimits(_this.startDragHandlePos + mouseDeltaY, 0, _this.visibleHeight - _this.scrollHandleHeight);
            var newScrollValue = _this.getScrollValueFromHandlePosition(handleTopPosition);
            _this.updateScrollPosition(newScrollValue);
        };
        _this.onHandleDragEnd = function (event) {
            _this.setState({
                onDrag: false
            });
            event.preventDefault();
            document.removeEventListener('mousemove', _this.onHandleDrag);
            document.removeEventListener('mouseup', _this.onHandleDragEnd);
        };
        return _this;
    }
    CustomScrollBar.prototype.componentDidMount = function () {
        var _this = this;
        this.adjustCustomScrollPosToContentPos(0);
        this.updateOnStartTimeoutToken = setInterval(function () {
            _this.updateScrollPosition(_this.state.scrollPos);
            _this.forceUpdate();
        }, 100);
        this.forceUpdate();
    };
    CustomScrollBar.prototype.componentDidUpdate = function (prevProps) {
        var domNode = ReactDOM.findDOMNode(this);
        var boundingRect = domNode.getBoundingClientRect();
        var innerContainer = this.getScrolledElement();
        if (innerContainer) {
            this.contentHeight = innerContainer.scrollHeight;
            this.scrollbarYWidth = innerContainer.offsetWidth - innerContainer.clientWidth;
            this.visibleHeight = innerContainer.clientHeight;
            this.scrollRatio = this.contentHeight ? this.visibleHeight / this.contentHeight : 1;
            if (this.scrollRatio != 1) {
                this.showHandle = true;
            }
            else {
                this.showHandle = false;
            }
            this.toggleScrollIfNeeded();
            this.position = {
                top: boundingRect.top + window.pageYOffset,
                left: boundingRect.left + window.pageXOffset
            };
            this.freezePosition(prevProps);
        }
    };
    CustomScrollBar.prototype.componentWillUnmount = function () {
        clearInterval(this.updateOnStartTimeoutToken);
        document.removeEventListener('mousemove', this.onHandleDrag);
        document.removeEventListener('mouseup', this.onHandleDragEnd);
    };
    CustomScrollBar.prototype.ensureWithinLimits = function (value, min, max) {
        min = (!min && min !== 0) ? value : min;
        max = (!max && max !== 0) ? value : max;
        if (min > max) {
            console.error('min limit is greater than max limit');
            return value;
        }
        if (value < min) {
            return min;
        }
        if (value > max) {
            return max;
        }
        return value;
    };
    CustomScrollBar.prototype.enforceMinHandleHeight = function (calculatedStyle) {
        var minHeight = this.props.minScrollHandleHeight;
        if (calculatedStyle.height >= minHeight) {
            return calculatedStyle;
        }
        var diffHeightBetweenMinAndCalculated = minHeight - calculatedStyle.height;
        var scrollPositionToAvailableScrollRatio = this.state.scrollPos / (this.contentHeight - this.visibleHeight);
        var scrollHandlePosAdjustmentForMinHeight = diffHeightBetweenMinAndCalculated * scrollPositionToAvailableScrollRatio;
        var handlePosition = calculatedStyle.top - scrollHandlePosAdjustmentForMinHeight;
        var result = {
            height: minHeight || 0,
            top: handlePosition || 0,
        };
        if (calculatedStyle.display) {
            result.display = calculatedStyle.display;
        }
        return result;
    };
    CustomScrollBar.prototype.freezePosition = function (prevProps) {
        var innerContainer = this.getScrolledElement();
        var contentWrapper = this.refs.contentWrapper;
        if (this.props.freezePosition) {
            contentWrapper.scrollTop = this.state.scrollPos;
        }
        if (prevProps.freezePosition) {
            innerContainer.scrollTop = this.state.scrollPos;
        }
    };
    CustomScrollBar.prototype.toggleScrollIfNeeded = function () {
        var shouldHaveScroll = this.contentHeight - this.visibleHeight > 1;
        if (this.hasScroll !== shouldHaveScroll) {
            this.hasScroll = shouldHaveScroll;
            this.forceUpdate();
        }
    };
    CustomScrollBar.prototype.updateScrollPosition = function (scrollValue) {
        var innerContainer = this.getScrolledElement();
        innerContainer.scrollTop = scrollValue;
        this.setState({
            scrollPos: scrollValue
        });
    };
    CustomScrollBar.prototype.isClickOnScrollHandle = function (event) {
        var scrollHandle = ReactDOM.findDOMNode(this.refs.scrollHandle);
        return event.target === scrollHandle || event.target.parentElement === scrollHandle;
    };
    CustomScrollBar.prototype.calculateNewScrollHandleTop = function (clickEvent) {
        var clickYRelativeToScrollbar = clickEvent.pageY - this.position.top;
        var scrollHandleTop = this.getScrollHandleStyle().top;
        var newScrollHandleTop;
        var isBelowHandle = clickYRelativeToScrollbar > (scrollHandleTop + this.scrollHandleHeight);
        if (isBelowHandle) {
            newScrollHandleTop = scrollHandleTop + Math.min(this.scrollHandleHeight, this.visibleHeight - this.scrollHandleHeight);
        }
        else {
            newScrollHandleTop = scrollHandleTop - Math.max(this.scrollHandleHeight, 0);
        }
        return newScrollHandleTop;
    };
    CustomScrollBar.prototype.getScrollValueFromHandlePosition = function (handlePosition) {
        return (handlePosition) / this.scrollRatio;
    };
    CustomScrollBar.prototype.getScrollHandleStyle = function () {
        var handlePosition = this.state.scrollPos * this.scrollRatio;
        var innerContainer = this.getScrolledElement();
        var display = false;
        this.scrollHandleHeight = this.visibleHeight * this.scrollRatio;
        if (innerContainer && innerContainer.clientHeight) {
            if (innerContainer.clientHeight > 0 &&
                innerContainer.clientHeight > this.scrollHandleHeight &&
                this.scrollHandleHeight > 0 &&
                this.showHandle) {
                display = true;
            }
        }
        return {
            display: (display) ? 'block' : 'none',
            height: this.scrollHandleHeight,
            top: handlePosition
        };
    };
    CustomScrollBar.prototype.adjustCustomScrollPosToContentPos = function (scrollPosition) {
        this.setState({
            scrollPos: scrollPosition
        });
    };
    CustomScrollBar.prototype.onScroll = function (event) {
        if (this.props.freezePosition) {
            return;
        }
        this.adjustCustomScrollPosToContentPos(event.currentTarget.scrollTop);
        if (this.props.onScroll) {
            this.props.onScroll(event);
        }
    };
    CustomScrollBar.prototype.getScrolledElement = function () {
        return this.refs.innerContainer;
    };
    CustomScrollBar.prototype.onHandleMouseDown = function (event) {
        this.startDragHandlePos = this.getScrollHandleStyle().top;
        this.startDragMousePos = event.pageY;
        this.setState({
            onDrag: true
        });
        document.addEventListener('mousemove', this.onHandleDrag);
        document.addEventListener('mouseup', this.onHandleDragEnd);
    };
    CustomScrollBar.prototype.onWheel = function (event) {
        var contentNode = event.currentTarget;
        var totalHeight = contentNode.scrollHeight;
        var maxScroll = totalHeight - event.currentTarget.offsetHeight;
        var delta = event.deltaY % 3 ? (event.deltaY) : (event.deltaY * 8);
        var targetScroll = this.state.scrollPos + delta / 2;
        if (targetScroll > maxScroll) {
            targetScroll = maxScroll;
        }
        if (targetScroll < 0) {
            targetScroll = 0;
        }
        this.updateScrollPosition(targetScroll);
        event.preventDefault();
        event.stopPropagation();
    };
    CustomScrollBar.prototype.onTouchStart = function (event) {
        this.touchStart = event.touches[0].pageY;
    };
    CustomScrollBar.prototype.onTouch = function (event) {
        var touch = event.touches[0];
        if (touch) {
            var contentNode = event.currentTarget;
            var totalHeight = contentNode.scrollHeight;
            var maxScroll = totalHeight - event.currentTarget.offsetHeight;
            var targetScroll = this.state.scrollPos + (this.touchStart - touch.pageY);
            this.touchStart = touch.pageY;
            if (targetScroll > maxScroll) {
                targetScroll = maxScroll;
            }
            if (targetScroll < 0) {
                targetScroll = 0;
            }
            this.updateScrollPosition(targetScroll);
        }
        event.preventDefault();
        event.stopPropagation();
    };
    CustomScrollBar.prototype.getInnerContainerClasses = function () {
        var res = 'inner-container';
        if (this.state.scrollPos && this.props.addScrolledClass) {
            res += ' content-scrolled';
        }
        return res;
    };
    CustomScrollBar.prototype.getScrollStyles = function () {
        var innerContainerStyle = {
            height: this.props.heightRelativeToParent ? '100%' : ''
        };
        var contentWrapperStyle = {
            height: this.props.heightRelativeToParent ? '100%' : '',
            overflowY: this.props.freezePosition ? 'hidden' : 'visible'
        };
        return {
            innerContainer: innerContainerStyle,
            contentWrapper: contentWrapperStyle
        };
    };
    CustomScrollBar.prototype.getOuterContainerStyle = function () {
        return {
            height: this.props.heightRelativeToParent ? '100%' : ''
        };
    };
    CustomScrollBar.prototype.render = function () {
        var scrollStyles = this.getScrollStyles();
        var rootStyle = {
            height: this.props.heightRelativeToParent
        };
        var scrollHandleStyle = this.enforceMinHandleHeight.call(this, this.getScrollHandleStyle());
        return (React.createElement("div", { className: 'custom-scroll ' + (this.state.onDrag ? 'scroll-handle-dragged' : ''), style: rootStyle },
            React.createElement("div", { className: "outer-container", style: this.getOuterContainerStyle() },
                React.createElement("div", { className: "custom-scrollbar", onClick: this.onCustomScrollClick, key: "scrollbar" },
                    React.createElement("div", { ref: "scrollHandle", className: "custom-scroll-handle", style: scrollHandleStyle, onMouseDown: this.onHandleMouseDown.bind(this) },
                        React.createElement("div", { className: this.props.handleClass }))),
                React.createElement("div", { ref: "innerContainer", className: this.getInnerContainerClasses(), style: scrollStyles.innerContainer, onScroll: this.onScroll.bind(this), onWheel: this.onWheel.bind(this), onTouchStart: this.onTouchStart.bind(this), onTouchMove: this.onTouch.bind(this) },
                    React.createElement("div", { className: "content-wrapper", ref: "contentWrapper", style: scrollStyles.contentWrapper }, this.props.children)))));
    };
    return CustomScrollBar;
}(React.Component));
exports.CustomScrollBar = CustomScrollBar;
