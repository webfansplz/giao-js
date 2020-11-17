## 前言

> 在这篇文章中,我们将通过 JS 构建我们自己的 JS 解释器,用 JS 写 JS,这听起来很奇怪,尽管如此,这样做我们将更熟悉 JS,也可以学习 JS 引擎是如何工作的!

## 什么是解释器 (Interpreter) ?

> 解释器是在运行时运行的语言求值器，它动态地执行程序的源代码。它不同于编译器。编译器将语言源代码翻译成机器代码。
> 解释器解析源代码，从源代码生成 AST(抽象语法树)，遍历 AST 并逐个计算它们。

## 解释器 (Interpreter) 工作阶段

- 标记 (Tokenization)

- 解析 (Parsing)

- 求值 (Evaluating)

### 标记阶段 (Tokenization)

> 将源代码分解并组织成一组有意义的单词,称为标记(Token)。

在英语中,当我们遇到这样一个语句时:

```js
Javascript is the best language in the world
```

我们会下意识地把句子分解成一个个单词:

```js
+----------------------------------------------------------+
| Javascript | is | the | best | language | in |the |world |
+----------------------------------------------------------+
```

这是分析和理解句子的第一阶段。

标记任务是由**词法分析器（Lexical Analyser）**完成的,词法分析器会扫描（scanning）代码，提取词义单位；然后，会进行评估（evaluating），判断词义单位属于哪一类的值。

```js
var sum = 30;

// 词法分析后的结果
[
  ("var": "keyword"),
  ("sum": "identifier"),
  ("=": "assignment"),
  ("30": "integer"),
];
```

词法分析器将代码分解成 Token 后,会将 Token 传递给解析器进行解析,我们来看下解析阶段是如何工作的。

### 解析阶段 (Parsing)

> 将标记阶段生成的 Token 转换为抽象语法树(Abstract Syntax Tree),这一过程称之为解析(Parsing)。

在英语中,Javascript is the best language 被分解为以下单词:

```js
+------------------------------------------+
| Javascript | is | the | best | language  |
+------------------------------------------+
```

这样我们就可以挑选单词并形成语法结构:

```js
"Javascript": Subject
"is the best language": Predicate
"language": Object
```

Javascript 在语法中是一个主语名词,其余的是一个没有什么意义的句子叫做谓语,language 是动作的接受者,也就是宾语。结构是这样的:

```js
Subject(Noun) -> Predicate -> Object
```

解析任务是由**语法解析器 (Syntax Parser)**完成的,它会将上一步生成的 Token,根据语法规则,转为抽象语法树(AST)。

```js
{
  type: "Program",
  body: [
    {
      type: "VariableDeclaration",
      declarations: [
        {
          type: "VariableDeclarator",
          id: {
            type: "Identifier",
            name: "sum"
          },
          init: {
            type: "Literal",
            value: 30,
            raw: "30"
          }
        }
      ],
      kind: "var"
    }
  ],
}

```

### 求值阶段 (Evaluating)

> 解释器将遍历 AST 并计算每个节点。- 求值阶段

```js
1 + 2
|
    |
    v
+---+  +---+
| 1 |  | 2 |
+---+  +---+
  \     /
   \   /
    \ /
   +---+
   | + |
   +---+
{
    lhs: 1,
    op: '+'.
    rhs: 2
}
```

解释器解析 Ast,得到 LHS 节点,接着收集到操作符(operator)节点+,+操作符表示需要进行一次加法操作,它必须有第二个节点来进行加法操作.接着他收集到 RHS 节点。它收集到了有价值的信息并执行加法得到了结果,3。

```js
{
  type: "Program",
  body: [
    {
      type: "ExpressionStatement",
      expression: {
        type: "BinaryExpression",
        left: {
          type: "Literal",
          value: 1,
          raw: "1"
        },
        operator: "+",
        right: {
          type: "Literal",
          value: 2,
          raw: "2"
        }
      }
    }
  ],
}
```
