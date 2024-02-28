# Bounds Checks

默认情况下，在 Rust 中，对切片和向量等容器类型的访问涉及边界检查。这可能会影响性能，例如在热循环中，尽管发生的频率可能不如您所预期的那样频繁。

有几种安全的方法可以更改代码，以便编译器了解容器的长度并优化掉边界检查。

- 在循环中，通过迭代替换直接元素访问。
- 在循环中，不要对 Vec 进行索引，而是在循环之前创建 Vec 的切片，然后在循环中对切片进行索引。
- 在索引变量的范围上添加断言。
[**Example 1**](https://github.com/rust-random/rand/pull/960/commits/de9dfdd86851032d942eb583d8d438e06085867b),
[**Example 2**](https://github.com/image-rs/jpeg-decoder/pull/167/files).

让这些方法起作用可能有些棘手。[Bounds Check Cookbook]对这个主题进行了更详细的介绍

[Bounds Check Cookbook]: https://github.com/Shnatsel/bounds-check-cookbook/

作为最后的手段，还有不安全的方法 [get_unchecked] 和 [get_unchecked_mut]。

[`get_unchecked`]: https://doc.rust-lang.org/std/primitive.slice.html#method.get_unchecked
[`get_unchecked_mut`]: https://doc.rust-lang.org/std/primitive.slice.html#method.get_unchecked_mut

