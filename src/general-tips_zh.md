# 一般建议

本书前几节讨论了 Rust 特定的技术。本节简要概述了一些一般性能原则。

只要避免明显的陷阱（例如[使用非发布版本构建]），Rust 代码通常运行速度快且占用内存少。特别是如果你习惯于动态类型语言如 Python 和 Ruby，或者带有垃圾回收器的静态类型语言如 Java 和 C#。

[使用非发布版本构建]: build-configuration.md

优化的代码通常比未优化的代码更复杂，编写起来需要更多的工作。因此，只有值得优化热点代码时才值得进行优化。

最大的性能改进通常来自于算法或数据结构的更改，而不是低级优化。
[**Example 1**](https://github.com/rust-lang/rust/pull/53383/commits/5745597e6195fe0591737f242d02350001b6c590),
[**Example 2**](https://github.com/rust-lang/rust/pull/54318/commits/154be2c98cf348de080ce951df3f73649e8bb1a6).

编写能够与现代硬件良好配合的代码并不总是容易的，但值得努力。例如，尽量减少缓存未命中和分支预测错误。

大多数优化只会带来轻微的加速。虽然单个小的加速可能不明显，但如果你能做足够多的优化，它们的效果会累积起来。

不同的性能分析工具各有优势。最好使用多个工具。

当性能分析表明某个函数运行热点时，有两种常见的加速方法：（a）加快函数运行速度，和/或者（b）尽量减少调用次数。

消除愚蠢的减速往往比引入巧妙的加速更容易。

除非必要，避免计算。延迟/按需计算通常是明智的选择。
[**Example 1**](https://github.com/rust-lang/rust/pull/36592/commits/80a44779f7a211e075da9ed0ff2763afa00f43dc),
[**Example 2**](https://github.com/rust-lang/rust/pull/50339/commits/989815d5670826078d9984a3515eeb68235a4687).

一般复杂的情况往往可以通过乐观地检查比较简单的常见特殊情况来避免。
[**Example 1**](https://github.com/rust-lang/rust/pull/68790/commits/d62b6f204733d255a3e943388ba99f14b053bf4a),
[**Example 2**](https://github.com/rust-lang/rust/pull/53733/commits/130e55665f8c9f078dec67a3e92467853f400250),
[**Example 3**](https://github.com/rust-lang/rust/pull/65260/commits/59e41edcc15ed07de604c61876ea091900f73649).
尤其是在小尺寸占主导地位的情况下，特别处理0、1或2个元素的集合往往是一种好办法。
[**Example 1**](https://github.com/rust-lang/rust/pull/50932/commits/2ff632484cd8c2e3b123fbf52d9dd39b54a94505),
[**Example 2**](https://github.com/rust-lang/rust/pull/64627/commits/acf7d4dcdba4046917c61aab141c1dec25669ce9),
[**Example 3**](https://github.com/rust-lang/rust/pull/64949/commits/14192607d38f5501c75abea7a4a0e46349df5b5f),
[**Example 4**](https://github.com/rust-lang/rust/pull/64949/commits/d1a7bb36ad0a5932384eac03d3fb834efc0317e5).

同样，在处理重复性数据时，通常可以使用一种简单的数据压缩形式，对常见的值使用紧凑的表示方式，然后对不常见的值进行回退到二级表。
[**Example 1**](https://github.com/rust-lang/rust/pull/54420/commits/b2f25e3c38ff29eebe6c8ce69b8c69243faa440d),
[**Example 2**](https://github.com/rust-lang/rust/pull/59693/commits/fd7f605365b27bfdd3cd6763124e81bddd61dd28),
[**Example 3**](https://github.com/rust-lang/rust/pull/65750/commits/eea6f23a0ed67fd8c6b8e1b02cda3628fee56b2f).

当代码涉及多种情况时，测量各种情况的频率，并首先处理最常见的情况。

在涉及高局部性的查找时，将一个小缓存放在数据结构前面可能会带来好处。

优化的代码通常具有非显而易见的结构，这意味着解释性注释非常有价值，特别是那些参考了性能分析数据的注释。例如，“99% 的情况下，这个向量有 0 或 1 个元素，因此首先处理这些情况”这样的注释可以很有启发性。
