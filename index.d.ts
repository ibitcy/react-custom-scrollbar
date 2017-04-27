/// <reference types="react" />
import * as React from 'react';
export interface Props {
    allowOuterScroll: boolean;
    heightRelativeToParent: string;
    onScroll: Function;
    addScrolledClass: boolean;
    freezePosition: boolean;
    handleClass: string;
    minScrollHandleHeight: number;
}
export interface State {
    scrollPos: number;
    onDrag: boolean;
}
export declare class CustomScrollBar extends React.Component<Props, State> {
    state: State;
    private scrollbarYWidth;
    private contentHeight;
    private visibleHeight;
    private scrollRatio;
    private scrollHandleHeight;
    private hasScroll;
    private startDragHandlePos;
    private startDragMousePos;
    private touchStart;
    private showHandle;
    private updateOnStartTimeoutToken;
    private position;
    refs: {
        [string: string]: any;
        scrollHandle: any;
        innerContainer: any;
        contentWrapper: any;
    };
    private componentDidMount();
    private componentDidUpdate(prevProps);
    private componentWillUnmount();
    private ensureWithinLimits(value, min, max);
    private enforceMinHandleHeight(calculatedStyle);
    private freezePosition(prevProps);
    private toggleScrollIfNeeded();
    private updateScrollPosition(scrollValue);
    private onCustomScrollClick;
    private isClickOnScrollHandle(event);
    private calculateNewScrollHandleTop(clickEvent);
    private getScrollValueFromHandlePosition(handlePosition);
    private getScrollHandleStyle();
    private adjustCustomScrollPosToContentPos(scrollPosition);
    private onScroll(event);
    private getScrolledElement();
    private onHandleMouseDown(event);
    private onHandleDrag;
    private onHandleDragEnd;
    private onWheel(event);
    private onTouchStart(event);
    private onTouch(event);
    private getInnerContainerClasses();
    private getScrollStyles();
    private getOuterContainerStyle();
    render(): JSX.Element;
}
