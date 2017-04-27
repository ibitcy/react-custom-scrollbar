import * as React from 'react';
import {CustomScrollBar} from "../ui/custom-scroll";

export interface Props {

}

export interface State {
	currentTime: number
}

export class AppComponent extends React.Component<Props, State> {
	state: State = {
		currentTime: 0
	};

	private getTestContent():JSX.Element{
		return (
			<div>
				Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.

				Why do we use it?
				It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).
			</div>
		)
	}

	//static defaultProps: Props = {} as Props;

	public render() {
		return (
			<div>
				<div className="container" height="200">
					<CustomScrollBar
						allowOuterScroll={false}
						heightRelativeToParent={`200px`}
						onScroll={() => {}}
						addScrolledClass={true}
						freezePosition={false}
						handleClass="inner-handle"
						minScrollHandleHeight={38}
					>
						{this.getTestContent()}
					</CustomScrollBar>
				</div>
			</div>
		);
	}
}