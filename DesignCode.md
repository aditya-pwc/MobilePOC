# React Native项目开发规范

## 内容目录

1. [基本规范](#基本规范)
2. [命名](#命名)
3. [样式](#样式)
4. [代码对齐](#代码对齐)
5. [变量作用域](#变量作用域)
6. [引号](#引号)
7. [空格](#空格)
8. [属性](#属性)
9. [Refs](#Refs)
10. [括号](#括号)
11. [标签](#标签)
12. [函数](#函数)
13. [页面编写规范](#页面编写规范)
14. [模块声明](#模块声明)
15. [模块引用](#模块引用)
16. [控制语句](#控制语句)
17. [日志管理](#日志管理)
18. [异常捕获](#异常捕获)
19. [Code Review](#Code)

## <a id="基本规范">基本规范</a>
- 推荐使用JSX语法。
- 每个文件只写一个模块。
  - 但是多个[无状态模块](https://reactjs.org/docs/components-and-props.html#stateless-functions)可以放在单个文件中。eslint:[`react/no-multi-comp`](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-multi-comp.md#ignorestateless)
- 不要使用一个类维护多个业务，建议按功能划分。
- 两段功能或业务相同或类似的代码不应该出现两次。
- 使用第三方插件时应仔细阅读官方文档的Readme.md、issue、最新提交代码的时间，充分了解可能会出现的问题及解决办法，节省调试时间、降低开发难度。



## <a id="命名">命名</a>
- **文件名**：使用pascal命名法：LoginPage、ButtonComponent。
- **引用命名**：模块名使用pascal命名，实例使用驼峰命名.eslint:[`react/jsx-pascal-case`](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-pascal-case.md)
```{r, eval = FALSE, engine = "javascript"}
// bad
import loginPage from './LoginPage';

// good
import LoginPage from './LoginPage';

// bad
const LoginPage = <LoginPage />;

// good
const loginPage = <LoginPage />;
```
- **属性命名**：避免使用DOM相关的属性来用作其他的用途。
>对于style这样的属性名，我们会默认它们代表一些特殊的含义，如元素样式。在应用中使用这些属性来表示其他的含义会使代码更难阅读，更难维护，并且可能会引起bug。
```{JavaScript, eval = FALSE} 
// bad
<MyComponent style="fancy" />

// good
<MyComponent variant="fancy" />
```


## <a id="样式">样式</a>
- 当组件使用样式属性达到三个或三个以上时，必须使用StyleSheet来创建样式属性并进行引用。
```{JavaScript, eval = FALSE}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    marginTop:Common.scaleSize(10)
  }
 });
```
- 当使用单一或全局属性时，推荐使用公共样式类。
```{JavaScript, eval = FALSE}
// StyleCommon.js
export default {
  topColor:{
    backgroundColor: '#3A3D42',
  },
  mainView:{
    backgroundColor: '#12141B',
  },
 }
```


## <a id="代码对齐">代码对齐</a>
- 遵循以下的JSX语法缩进/格式。eslint: [`react/jsx-closing-bracket-location`](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-closing-bracket-location.md) [`react/jsx-closing-tag-location`](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-closing-tag-location.md)
```{JavaScript, eval = FALSE}
// bad
<Foo superLongParam="bar"
     anotherSuperLongParam="baz" />

// good, 有多行属性的话, 新建一行关闭标签
<Foo
  superLongParam="bar"
  anotherSuperLongParam="baz"
/>

// 若能在一行中显示, 直接写成一行
<Foo bar="bar" />

// 子元素按照常规方式缩进
<Foo
  superLongParam="bar"
  anotherSuperLongParam="baz"
>
  <Quux />
</Foo>
```



## <a id="变量作用域">变量作用域</a>
- 用`let`取代`var`。
```{JavaScript, eval = FALSE}
if (true) {
  console.log(x); // ReferenceError
  let x = 'hello';
}
```
>上面代码如果使用`var`替代`let`，`console.log`那一行就不会报错，而是会输出`undefined`，因为变量声明提升到代码块的头部。这违反了变量先声明后使用的原则。
- 在`let`和`const`之间，建议优先使用`const`，尤其是在全局环境，不应该设置变量，只应设置常量。
```{JavaScript, eval = FALSE}
// bad
let a = 1, b = 2, c = 3;

// good
const a = 1;
const b = 2;
const c = 3;

// best
const [a, b, c] = [1, 2, 3];
```
>`const`优于`let`有几个原因。一个是`const`可以提醒阅读程序的人，这个变量不应该改变；另一个是`const`比较符合函数式编程思想，运算不改变值，只是新建值，而且这样也有利于将来的分布式运算；最后一个原因是JavaScript编译器会对`const`进行优化，所以多使用`const`，有利于提高程序的运行效率，也就是说`let`和`const`的本质区别，其实是编译器内部的处理不同。




## <a id="引号">引号</a>
- 对于JSX属性值总是使用双引号(`"`)，其它使用单引号(`'`)。eslint: [`jsx-quotes`](https://github.com/eslint/eslint/blob/master/docs/rules/jsx-quotes.md)
```{JavaScript, eval = FALSE}
// bad
<Foo bar='bar' />

// good
<Foo bar="bar" />

// bad
<Foo style={{ left: "20px" }} />

// good
<Foo style={{ left: '20px' }} />
```
- 静态字符串一律使用单引号(`'`)，动态字符串使用反引号(`` ` `` )。
```{JavaScript, eval = FALSE}
// bad
const a = "foobar";
const b = 'foo' + a + 'bar';

// good
const a = 'foobar';
const b = `foo${a}bar`;
```



## <a id="空格">空格</a>
- 总是在自动关闭的标签前加一个空格，正常情况下也不需要换行. eslint: [`no-multi-spaces`](https://eslint.org/docs/rules/no-multi-spaces), [`react/jsx-tag-spacing`](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-tag-spacing.md)
```{JavaScript, eval = FALSE}
// bad
<Foo/>

// very bad
<Foo                 />

// bad
<Foo
 />

// good
<Foo />
```
- 不要在JSX`{}`引用括号里两边加空格. eslint: [`react/jsx-curly-spacing`](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-curly-spacing.md)
```{JavaScript, eval = FALSE}
// bad
<Foo bar={ baz } />

// good
<Foo bar={baz} />
```



## <a id="属性">属性</a>
- JSX属性名使用驼峰命名，首字母小写。
```{JavaScript, eval = FALSE}
// bad
<Foo
  UserName="hello"
  phone_number={12345678}
/>

// good
<Foo
  userName="hello"
  phoneNumber={12345678}
/>
```
- 如果属性值为`true`, 可以直接省略. eslint: [`react/jsx-boolean-value`](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-boolean-value.md)
```{JavaScript, eval = FALSE}
// bad
<Foo
  hidden={true}
/>

// good
<Foo
  hidden
/>

// good
<Foo hidden />
```
- 避免使用数组的index来作为属性key的值，推荐使用唯一ID。
```{JavaScript, eval = FALSE}
// bad
{todos.map((todo, index) =>
  <Todo
    {...todo}
    key={index}
  />
)}

// good
{todos.map(todo => (
  <Todo
    {...todo}
    key={todo.id}
  />
))}
```
- 尽可能少地使用扩展运算符。
>会传递一些不必要的属性。


例外情况：
- 使用了变量提升的高阶组件。
```{JavaScript, eval = FALSE}
function HOC(WrappedComponent) {
  return class Proxy extends React.Component {
    Proxy.propTypes = {
      text: PropTypes.string,
      isLoading: PropTypes.bool
    };

    render() {
      return <WrappedComponent {...this.props} />
    }
  }
}
```


特别提醒：尽可能地筛选出不必要的属性。同时，使用[prop-types-exact](https://www.npmjs.com/package/prop-types-exact)来预防问题出现。
```{JavaScript, eval = FALSE}
// bad
render() {
  const { irrelevantProp, ...relevantProps  } = this.props;
  return <WrappedComponent {...this.props} />
}

// good
render() {
  const { irrelevantProp, ...relevantProps  } = this.props;
  return <WrappedComponent {...relevantProps} />
}
```



## <a id="Refs">Refs</a>
- 总是在Refs里使用回调函数. eslint:[`react/no-string-refs`](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/no-string-refs.md)
```{JavaScript, eval = FALSE}
// bad
<Foo
  ref="myRef"
/>

// good
<Foo
  ref={(ref) => { this.myRef = ref; }}
/>
```



## 括号
- 将多行的JSX标签写在`()`里. eslint:[`react/jsx-wrap-multilines`](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-wrap-multilines.md)
```{JavaScript, eval = FALSE}
// bad
render() {
  return <MyComponent className="long body" foo="bar">
           <MyChild />
         </MyComponent>;
}

// good
render() {
  return (
    <MyComponent className="long body" foo="bar">
      <MyChild />
    </MyComponent>
  );
}

// good, 单行可以不需要
render() {
  const body = <div>hello</div>;
  return <MyComponent>{body}</MyComponent>;
}
```



## <a id="标签">标签</a>
- 对于没有子元素的标签来说总是自己关闭标签. eslint:[`react/self-closing-comp`](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/self-closing-comp.md)
```{JavaScript, eval = FALSE}
// bad
<Foo className="stuff"></Foo>

// good
<Foo className="stuff" />
```
- 如果模块有多行的属性， 关闭标签时新建一行. eslint:[`react/jsx-closing-bracket-location`](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-closing-bracket-location.md)
```{JavaScript, eval = FALSE}
// bad
<Foo
  bar="bar"
  baz="baz" />

// good
<Foo
  bar="bar"
  baz="baz"
/>
```



## 函数
- 当在`render()`里使用事件处理方法时，提前在构造函数里把`this`绑定上去. eslint:[`react/jsx-no-bind`](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/jsx-no-bind.md)
>在每次`render`过程中， 再调用`bind`都会新建一个新的函数，浪费资源。
```{JavaScript, eval = FALSE}
// bad
class extends React.Component {
  onClick() {
    // do stuff
  }

  render() {
    return <Button onClick={this.onClick.bind(this)} />;
  }
}

// good
class extends React.Component {
  constructor(props) {
    super(props);

    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    // do stuff
  }

  render() {
    return <Botton onClick={this.onClick} />;
  }
}
```
- 在 render 方法中总是确保`return`返回值. eslint:[`react/require-render-return`](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/require-render-return.md)
```{JavaScript, eval = FALSE}
// bad
render() {
  (<div />);
}

// good
render() {
  return (<div />);
}
```




## <a id="页面编写规范">页面编写规范</a>
- 如果你的模块有内部状态或者是`refs`, 推荐使用`class extends React.Component`而不是`React.createClass`。eslint: [`react/prefer-es6-class`](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/prefer-es6-class.md)[`react/prefer-stateless-function`](https://github.com/yannickcr/eslint-plugin-react/blob/master/docs/rules/prefer-stateless-function.md)
```{JavaScript, eval = FALSE}
// bad
const Listing = React.createClass({
  // ...
  render() {
    return <div>{this.state.hello}</div>;
  }
});

// good
class Listing extends React.Component {
  // ...
  render() {
    return <div>{this.state.hello}</div>;
  }
}
```
- 如果你的模块没有状态或是没有引用`refs`， 推荐使用普通函数（非箭头函数）而不是类。
```{JavaScript, eval = FALSE}
// bad
class Listing extends React.Component {
  render() {
    return <div>{this.props.hello}</div>;
  }
}

// bad (relying on function name inference is discouraged)
const Listing = ({ hello }) => (
  <div>{hello}</div>
);

// good
function Listing({ hello }) {
  return <div>{hello}</div>;
}
```
- React Hooks：一般hooks的基本代码结构如下：
```{JavaScript, eval = FALSE}
function useHook (option) {
  // states
  const [someState, setSomeState] = useState(initialValue);
  // derived state
  const computedState = useMemo(() => computed, [dependencies]);

  // refs
  const refSomething = useRef();

  // side effect
  useEffect(() => {}, []);
  useEffect(() => {}, [dependencies]);

  // state operations
  const handleChange = useCallback(() => {
    setSomeState(newState)
  }, [])

  // output
  return <View>{...}</View>
}
```
>一些**注意事项**：
>- 只能在组件顶层调用hooks。不要在循环，控制流和嵌套的函数中调用hooks。
>- 自定义hooks使用use*命名。

- `render()`函数代码过长时，请适当进行拆分，拆分为“页面内组件”，提高可读性。`render()`函数代码原则上不超过八十行，超过之后，请进行拆分。
- 单行代码原则上不应超过120个字符，超过后请换行或精简代码。




## <a id="模块声明">模块声明</a>
- 不要使用 displayName 来命名React模块，而是使用引用来命名模块， 如class名称.
```{JavaScript, eval = FALSE}
// bad
export default React.createClass({
  displayName: 'LoginPage',
  // stuff goes here
});

// good
export default class LoginPage extends React.Component {
}
```



## <a id="模块引用">模块引用</a>
- 对组件引用，变量引用，需遵循以下方式：
```{JavaScript, eval = FALSE}
import React, {Component} from 'react';
// from react,react-native优先；
import{
  View,
  Text,
  Platform,
  Dimensions,
  TouchableHighlight,
  Image,
  StyleSheet,
  InteractionManager,
} from 'react-native';

// from npm库其次；
import { connect } from 'react-redux';
          
// from 项目内组件其次；
import LoadingAndTime from '../component/LoadingAndTime';
import { performLoginAction } from '../action/LoginAction'
import {encode} from '../common/Base64';
 
// 变量初始化，常量初始化 最后；
const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const typeCode = Platform.OS == 'android' ? 'android-phone' : 'ios-phone'
const selectColor=Platform.OS=='android' ? null : 'white'
```
- 未使用的组件应删除引用，未使用的常量，应删除初始化语句。



## <a id="控制语句">控制语句</a>
- 在一个`switch`块内，每个`case`要么通过`break/return`等来终止，要么注释说明程序将继续执行到哪一个`case`为止;在一个`switch`块内，都必须包含一个`default`语句并且放在最后，即使它什么代码也没有。eslint:[`default-case`](https://github.com/eslint/eslint/blob/master/docs/rules/default-case.md)。
- 在`if/else/for/while/do`语句中必须使用大括号，即使只有一行代码。
```
// bad
if (condition) statements

// good
if (condition) {
  statements
}
```
- 方式表达逻辑，不要超过3层，超过请使用状态设计模式或卫语句。esling:[`no-else-return`](https://github.com/eslint/eslint/blob/master/docs/rules/no-else-return.md)
```{JavaScript, eval = FALSE}
// bad
if (isReqeustError) {
  console.log('isReqeustError is true');
} else {
  if (!classList.length) {
    console.log('classList's length is zero');
  } else {
    console.log('classList's length is more than zero');
  }
}

// good
if(isReqeustError) {
  console.log('isReqeustError is true');
  return;
}
if(!classList.length) {
  console.log('classList's length is zero');
  return;
}
console.log('classList's length is more than zero');
```
- 使用三目运算，替换`if/else`结构，精简代码。



## <a id="日志管理">日志管理</a>
- 代码中过多使用`console.log()`会消耗性能，上传代码或打包时应去除`console.*`语句。eslint:[`no-console`](https://github.com/eslint/eslint/blob/master/docs/rules/no-console.md)。
- 在入口文件添加以下代码。
```{JavaScript, eval = FALSE}
if (!__DEV__) {
  global.console = {
    info: () => {},
    log: () => {},
    warn: () => {},
    error: () => {},
  }
}
```
>说明：可以在发布时屏蔽掉所有的`console.*`调用。React Native中有一个全局变量`__DEV__`用于指示当前运行环境是否是开发环境。我们可以据此在正式环境中替换掉系统原先的`console.*`实现。这样在打包发布时，所有的控制台语句就会被自动替换为空函数，而在调试时它们仍然会被正常调用。



## <a id="异常捕获">异常捕获</a>

* 本App由于在线离线都可用，涉及到大量读写数据库的操作，为防止应用程序崩溃闪退，需要将DML操作与网络操作放在`try...catch`中





### 了解更多代码规范：[`Eslint`](https://github.com/eslint/eslint/tree/master/docs/rules)，[`Eslint-plugin-React`](https://github.com/yannickcr/eslint-plugin-react/tree/master/docs/rules)。



## <a id="Code">Code Review</a>
上述的lint规则和类型检查，可以约束代码风格，避免低级的语法错误。但是即使通过上面的lint检查，代码也未必是“好代码”。
很多代设计的“最佳实践”是无法通过具像化的自动化工具或文档覆盖的，这时候，“经验”或者“群体智慧”就派上用场了，比如Code Review阶段会检查这些东西：
- 编程原则、设计思想。例如设计是否简洁易扩展。
- 模块耦合程度、代码重复。
- 代码健壮性。是否存在内存泄漏、是否存在线程安全、是否有潜在性能问题和异常、错误是否被处理。
- 代码性能和效率。
- 是否有没有考虑到的场景？


### **Code Review有很多好处**，比如：
- 对代码可读性的考察。
- Code Review可以让其他成员都熟悉代码。这样保证其他人都可以较快的接手你的工作，或者帮助你解决某些问题。
- 提高代码质量。毫无疑问，一方面是主动性的代码质量提升，比如代码需要被人Review，会自觉尽量的提高代码质量；另一方面，其他成员可以检查提交方的代码质量。
- Code Review的过程是一种学习技术的好途径。每次Code Review的过程都是一次真实的案例讲解，可以较快的提高成员的能力。
- Code Review可以打造良好的技术氛围。提交代码的人，希望自己写的代码足够优秀，毕竟被同事Review出很多烂代码，是件很丢人的事。而做Code Review的人，也希望自己尽可能的提出有建设性的意见，展示自己的能力。这本身就能增进技术的交流，活跃技术氛围，培养大家的Geek精神，对代码优美的追求。
- Code Review是一种沟通方式。


### **Code Review是摒弃个人英雄主义的作坊式开发模式的有效手段。**
- 在一个成熟的团队里，所有的架构设计、实现，都应该是一个团队的产出。尽管这个过程可能会由某个人来主导，但应该是经过整个团队共同智慧的结晶。经过团队多人Review，打磨，代码蕴含的是整个团队的智慧，**可以保证代码按照团队中的最高水平输出**。


### **Code Review**有两种方式：一个`提交时`，一个是`定时`。
- `提交时`。Pull Request。只有代码通过测试、和其他成员Review才可以合并进正式版本库。这种方式也成为“阻塞式”代码检查，一般配合GitFlow工作流使用。
- `定时`。在项目完结后、项目的某个里程碑、或者固定的时间。团队成员聚在一起，回顾自己写的代码，让其他成员进行审查。


Code Review是比较难以推行的，项目工期紧张的情况下，`定时`Review会更有用。


### Code Review check list
#### 设计
- 单一职责原则。一个类只能干一件事，一个方法最好也只干一件事。
- 行为是否统一。比如缓存是否统一，错误处理、错误提示、弹出框是否统一等等。同一逻辑/行为，有没有走同一个Code Path。
- 代码污染。代码是否对其他模块强耦合。
- 重复代码。是否把公用组件，可复用代码抽取出来。
- 健壮性
  - 逻辑健壮，有没有潜在bug。
  - 有没有循环依赖，内存泄漏。
  - 数据访问的一致性。
- 错误处理。有没有很好的Error Handling。
- 改动是不是对代码的提升。新的改动是打补丁，让代码质量继续恶化，还是对代码质量进行了修复。
- 效率/性能
  - 对频繁的消息和较大的数据操作是否处理得当。
  - 关键算法的时间复杂度。
#### 风格
- 可读性。个人认为，代码的可读性可能比任何方面都要重要。可读性好的代码，代表后期维护成本低，线上bug容易排查，新人容易熟悉代码。而且可读性好，也说明代码足够简单，出错的可能性小，代码的组织架构合理。
- 命名规范。是否符合命名规范。
- 函数长度。函数太长，应该反思是否违反了单一职责原则。
- 注释。合理有效的注释可以提高代码的可读性。
#### 自我检查
- 每次提交前整体把自己的代码过一遍非常有帮助，尤其是看看有没有犯低级错误。
#### 如何进行Code Review
- 大部分情况下，小组内的同事都是坐在一起的，面对面的Code Review是非常有效的。
- 区分重点，不要舍本逐末。优先抓住可读性，设计，健壮性等重点问题。
#### Code Review的意识
- 必要时进行重构，随着项目的迭代，在计划新增功能的同时，要主动计划重构的工作项。
- 开放的心态，虚心接受大家的意见。


