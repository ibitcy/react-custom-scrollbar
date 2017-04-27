# react-custom-scrollbar

Custom vertical scrollbar 

## How to install
```
npm i react-custom-scrollbar --save
```

## How to import
For TypeScript usage there is a index.d.ts in node_modules folder
```typescript
import {CustomScrollBar} from 'react-custom-scrollbar';
```

or

```javascript
var CustomScrollBar = require('react-custom-scrollbar');
```

Also use css in a lib folder in: 

```
node_modules/react-video-seek-slider/lib/react-custom-scrollbar.css
```

## How to use
```jsx harmony
    <CustomScrollBar
        allowOuterScroll={false}
        heightRelativeToParent={`calc(100% - 300px)`}
        onScroll={() => {}} 
        addScrolledClass={true}
        freezePosition={false}
        handleClass="inner-handle"
        minScrollHandleHeight={38}
    >
        //Inner components here...
    </CustomScrollBar>
```

### Specification

* `allowOuterScroll`: (boolean, required)
* `heightRelativeToParent`: (string, required)
* `onScroll`: (Function, required)
* `addScrolledClass`: (boolean, required)
* `freezePosition`: (boolean, required)
* `handleClass`: (string, required)
* `minScrollHandleHeight` : (number, required)


## For development
just use:

+ $ yarn or $ npm i
+ $ gulp

open your browser http://localhost:3000

## For Build

$ ./production
