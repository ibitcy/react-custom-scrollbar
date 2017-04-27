import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface Props {
	allowOuterScroll:boolean,
	heightRelativeToParent:string,
	onScroll:Function,
	addScrolledClass:boolean,
	freezePosition:boolean,
	handleClass:string,
	minScrollHandleHeight:number
}

export interface State {
	scrollPos:number,
	onDrag:boolean
}

export class CustomScrollBar extends React.Component<Props, State> {
	state:State = {
		scrollPos: 0,
		onDrag: false
	};

	private scrollbarYWidth:number = 0;
	private contentHeight:number = 0;
	private visibleHeight:number = 0;
	private scrollRatio:number = 0;
	private scrollHandleHeight:number = 0;
	private hasScroll:boolean = true;
	private startDragHandlePos:number = 0;
	private startDragMousePos:number = 0;
	private touchStart:number = 0;
	private showHandle:boolean = false;
	private updateOnStartTimeoutToken = null;
	private position = {
		top: 0,
		left: 0
	};

	refs: {
		[string: string]: any;
		scrollHandle: any,
		innerContainer: any,
		contentWrapper: any
	};

	private componentDidMount():void {
		this.adjustCustomScrollPosToContentPos(0);

		this.updateOnStartTimeoutToken = setInterval(() => {
			this.updateScrollPosition(this.state.scrollPos);
			this.forceUpdate();
		}, 100);

		this.forceUpdate();
	}

	private componentDidUpdate(prevProps:Props):void {
		let domNode = ReactDOM.findDOMNode(this);
		let boundingRect = domNode.getBoundingClientRect();
		let innerContainer = this.getScrolledElement();

		if(innerContainer) {
			this.contentHeight = innerContainer.scrollHeight;
			this.scrollbarYWidth = innerContainer.offsetWidth - innerContainer.clientWidth;
			this.visibleHeight = innerContainer.clientHeight;
			this.scrollRatio = this.contentHeight ? this.visibleHeight / this.contentHeight : 1;

			if(this.scrollRatio != 1) {
				this.showHandle = true;
			} else {
				this.showHandle = false;
			}

			this.toggleScrollIfNeeded();

			this.position = {
				top: boundingRect.top + window.pageYOffset,
				left: boundingRect.left + window.pageXOffset
			};

			this.freezePosition(prevProps);
		}
	}

	private componentWillUnmount():void {
		clearInterval(this.updateOnStartTimeoutToken);

		document.removeEventListener('mousemove', this.onHandleDrag);
		document.removeEventListener('mouseup', this.onHandleDragEnd);
	}

	private ensureWithinLimits(value:number, min:number, max:number):number {
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
	}

	private enforceMinHandleHeight(calculatedStyle):any {
		let minHeight:number = this.props.minScrollHandleHeight;

		if (calculatedStyle.height >= minHeight) {
			return calculatedStyle;
		}

		let diffHeightBetweenMinAndCalculated:number = minHeight - calculatedStyle.height;
		let scrollPositionToAvailableScrollRatio:number = this.state.scrollPos / (this.contentHeight - this.visibleHeight);
		let scrollHandlePosAdjustmentForMinHeight:number = diffHeightBetweenMinAndCalculated * scrollPositionToAvailableScrollRatio;
		let handlePosition:number = calculatedStyle.top - scrollHandlePosAdjustmentForMinHeight;

		let result:any = {
			height: minHeight || 0,
			top: handlePosition || 0,
		};

		if(calculatedStyle.display) {
			result.display = calculatedStyle.display;
		}

		return result;
	}

	private freezePosition(prevProps:Props) {
		let innerContainer = this.getScrolledElement();
		let contentWrapper = this.refs.contentWrapper;

		if (this.props.freezePosition) {
			contentWrapper.scrollTop = this.state.scrollPos;
		}

		if (prevProps.freezePosition) {
			innerContainer.scrollTop = this.state.scrollPos;
		}
	}

	private toggleScrollIfNeeded():void {
		let shouldHaveScroll = this.contentHeight - this.visibleHeight > 1;

		if (this.hasScroll !== shouldHaveScroll) {
			this.hasScroll = shouldHaveScroll;
			this.forceUpdate();
		}
	}

	private updateScrollPosition(scrollValue:number):void {
		let innerContainer = this.getScrolledElement();

		innerContainer.scrollTop = scrollValue;

		this.setState({
			scrollPos: scrollValue
		} as State);
	}

	private onCustomScrollClick = (event):void => {
		if (this.isClickOnScrollHandle(event)) {
			return;
		}

		let newScrollHandleTop = this.calculateNewScrollHandleTop(event);
		let newScrollValue = this.getScrollValueFromHandlePosition(newScrollHandleTop);

		this.updateScrollPosition(newScrollValue);
	};

	private isClickOnScrollHandle(event):boolean {
		var scrollHandle = ReactDOM.findDOMNode(this.refs.scrollHandle);
		return event.target === scrollHandle || event.target.parentElement === scrollHandle;
	}

	private calculateNewScrollHandleTop(clickEvent:MouseEvent):number {
		let clickYRelativeToScrollbar:number = clickEvent.pageY - this.position.top;
		let scrollHandleTop:number = this.getScrollHandleStyle().top;
		let newScrollHandleTop:number;
		let isBelowHandle = clickYRelativeToScrollbar > (scrollHandleTop + this.scrollHandleHeight);

		if (isBelowHandle) {
			newScrollHandleTop = scrollHandleTop + Math.min(this.scrollHandleHeight, this.visibleHeight - this.scrollHandleHeight);
		} else {
			newScrollHandleTop = scrollHandleTop - Math.max(this.scrollHandleHeight, 0);
		}

		return newScrollHandleTop;
	}

	private getScrollValueFromHandlePosition(handlePosition:number):number {
		return (handlePosition) / this.scrollRatio;
	}

	private getScrollHandleStyle():any {
		let handlePosition:number = this.state.scrollPos * this.scrollRatio;
		let innerContainer = this.getScrolledElement();
		let display:boolean = false;

		this.scrollHandleHeight = this.visibleHeight * this.scrollRatio;

		if(innerContainer && innerContainer.clientHeight) {
			if(
				innerContainer.clientHeight > 0 &&
				innerContainer.clientHeight > this.scrollHandleHeight &&
				this.scrollHandleHeight > 0 &&
				this.showHandle
			) {
				display = true;
			}
		}

		return {
			display: (display) ? 'block' : 'none',
			height: this.scrollHandleHeight,
			top: handlePosition
		};
	}

	private adjustCustomScrollPosToContentPos(scrollPosition:number):void {
		this.setState({
			scrollPos: scrollPosition
		} as State);
	}

	private onScroll(event):void {
		if (this.props.freezePosition) {
			return;
		}

		this.adjustCustomScrollPosToContentPos(event.currentTarget.scrollTop);

		if (this.props.onScroll) {
			this.props.onScroll(event);
		}
	}

	private getScrolledElement():HTMLElement {
		return this.refs.innerContainer;
	}

	private onHandleMouseDown(event:MouseEvent):void {
		this.startDragHandlePos = this.getScrollHandleStyle().top;
		this.startDragMousePos = event.pageY;

		this.setState({
			onDrag: true
		} as State);

		document.addEventListener('mousemove', this.onHandleDrag);
		document.addEventListener('mouseup', this.onHandleDragEnd);
	}

	private onHandleDrag = (event:MouseEvent):void => {
		event.preventDefault();

		let mouseDeltaY:number = event.pageY - this.startDragMousePos;
		let handleTopPosition:number = this.ensureWithinLimits(this.startDragHandlePos + mouseDeltaY, 0, this.visibleHeight - this.scrollHandleHeight);
		let newScrollValue:number = this.getScrollValueFromHandlePosition(handleTopPosition);

		this.updateScrollPosition(newScrollValue);
	};

	private onHandleDragEnd = (event:MouseEvent):void => {
		this.setState({
			onDrag: false
		} as State);

		event.preventDefault();
		document.removeEventListener('mousemove', this.onHandleDrag);
		document.removeEventListener('mouseup', this.onHandleDragEnd);
	};

	private onWheel(event):void {
		let contentNode = event.currentTarget;
		let totalHeight = contentNode.scrollHeight;
		let maxScroll:number = totalHeight - event.currentTarget.offsetHeight;
		let delta:number = event.deltaY % 3 ? (event.deltaY) : (event.deltaY * 8);
		let targetScroll:number = this.state.scrollPos + delta / 2;

		if(targetScroll > maxScroll) {
			targetScroll = maxScroll;
		}

		if(targetScroll < 0) {
			targetScroll = 0;
		}

		this.updateScrollPosition(targetScroll);

		event.preventDefault();
		event.stopPropagation();
	}

	private onTouchStart(event):void {
		this.touchStart = event.touches[0].pageY;
	}

	private onTouch(event):void {
		let touch = event.touches[0];

		if(touch) {
			let contentNode = event.currentTarget;
			let totalHeight = contentNode.scrollHeight;
			let maxScroll: number = totalHeight - event.currentTarget.offsetHeight;
			let targetScroll:number = this.state.scrollPos + (this.touchStart - touch.pageY);

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
	}

	private getInnerContainerClasses():string {
		let res:string = 'inner-container';

		if (this.state.scrollPos && this.props.addScrolledClass) {
			res += ' content-scrolled';
		}

		return res;
	}

	private getScrollStyles():any {
		let innerContainerStyle = {
			height: this.props.heightRelativeToParent ? '100%' : ''
		};

		let contentWrapperStyle = {
			height: this.props.heightRelativeToParent ? '100%' : '',
			overflowY: this.props.freezePosition ? 'hidden' : 'visible'
		};

		return {
			innerContainer: innerContainerStyle,
			contentWrapper: contentWrapperStyle
		};
	}

	private getOuterContainerStyle() {
		return {
			height: this.props.heightRelativeToParent ? '100%' : ''
		};
	}

	public render() {
		let scrollStyles = this.getScrollStyles();
		let rootStyle = {
			height: this.props.heightRelativeToParent
		};
		let scrollHandleStyle = this.enforceMinHandleHeight.call(this, this.getScrollHandleStyle());

		return (
			<div className={'custom-scroll ' + (this.state.onDrag ? 'scroll-handle-dragged' : '')}
				 style={rootStyle}>
				<div className="outer-container" style={this.getOuterContainerStyle()}>
					<div className="custom-scrollbar" onClick={this.onCustomScrollClick} key="scrollbar">
						<div ref="scrollHandle" className="custom-scroll-handle" style={scrollHandleStyle}
							 onMouseDown={this.onHandleMouseDown.bind(this)}>
							<div className={this.props.handleClass}></div>
						</div>
					</div>

					<div ref="innerContainer"
						 className={this.getInnerContainerClasses()}
						 style={scrollStyles.innerContainer}
						 onScroll={this.onScroll.bind(this)}
						 onWheel={this.onWheel.bind(this)}
						 onTouchStart={this.onTouchStart.bind(this)}
						 onTouchMove={this.onTouch.bind(this)}
					>
						<div className="content-wrapper"
							 ref="contentWrapper"
							 style={scrollStyles.contentWrapper}
						>
							{this.props.children}
						</div>
					</div>
				</div>
			</div>
		);
	}
}