# Standard Library Types

值得阅读常见标准库类型的文档--如[`Vec`]、[`Option`]、[`Result`]和[`Rc`]--以找到有趣的函数，有时可以用来提高性能。

[`Vec`]: https://doc.rust-lang.org/std/vec/struct.Vec.html
[`Option`]: https://doc.rust-lang.org/std/option/enum.Option.html
[`Result`]: https://doc.rust-lang.org/std/result/enum.Result.html
[`Rc`]: https://doc.rust-lang.org/std/rc/struct.Rc.html

还值得了解标准库类型的高性能替代品，如[`Mutex`]、[`RwLock`]、[`Condvar`]和[`Once`]。

[`Mutex`]: https://doc.rust-lang.org/std/sync/struct.Mutex.html
[`RwLock`]: https://doc.rust-lang.org/std/sync/struct.RwLock.html
[`Condvar`]: https://doc.rust-lang.org/std/sync/struct.Condvar.html
[`Once`]: https://doc.rust-lang.org/std/sync/struct.Once.html

## `Box`
表达式 [`Box::default()`] 的效果与 `Box::new(T::default())` 相同，但可能更快，因为编译器可以直接在堆上创建值，而不是在堆栈上构造值然后复制它。
[**示例**](https://github.com/komora-io/art/commit/d5dc58338f475709c375e15976d0d77eb5d7f7ef)。

[`Box::default()`]: https://doc.rust-lang.org/std/boxed/struct.Box.html#method.default

## `Vec`

创建长度为 `n` 的零填充 `Vec` 的最佳方法是使用 `vec![0; n]`。这种方法简单且可能比其他方法更快，比如使用 `resize`、`extend` 或涉及 `unsafe` 的任何操作，因为它可以利用操作系统的帮助。

[`Vec::remove`] 会移除特定索引处的元素，并将所有后续元素向左移动一个位置，这使得它的时间复杂度为 O(n)。[`Vec::swap_remove`] 会用最后一个元素替换特定索引处的元素，这不会保留顺序，但时间复杂度为 O(1)。

[`Vec::retain`] 可以高效地从 `Vec` 中移除多个项。其他集合类型如 `String`、`HashSet` 和 `HashMap` 也有类似的方法。

[`Vec::remove`]: https://doc.rust-lang.org/std/vec/struct.Vec.html#method.remove
[`Vec::swap_remove`]: https://doc.rust-lang.org/std/vec/struct.Vec.html#method.swap_remove
[`Vec::retain`]: https://doc.rust-lang.org/std/vec/struct.Vec.html#method.retain

## `Option` and `Result`

[`Option::ok_or']将`Option'转换为`Result'，并传递一个`err'参数，如果`Option'值为`None'，则使用该参数。`err`是急于计算的。如果它的计算很昂贵，你应该使用[`Option::ok_or_else`]，它通过一个闭包缓慢地计算错误值。
例如，这个。
```rust
# fn expensive() {}
# let o: Option<u32> = None;
let r = o.ok_or(expensive()); // always evaluates `expensive()`
```
should be changed to this:
```rust
# fn expensive() {}
# let o: Option<u32> = None;
let r = o.ok_or_else(|| expensive()); // evaluates `expensive()` only when needed
```
[**Example**](https://github.com/rust-lang/rust/pull/50051/commits/5070dea2366104fb0b5c344ce7f2a5cf8af176b0).

[`Option::ok_or`]: https://doc.rust-lang.org/std/option/enum.Option.html#method.ok_or
[`Option::ok_or_else`]: https://doc.rust-lang.org/std/option/enum.Option.html#method.ok_or_else

[`Option::map_or`]、[`Option::unwrap_or`]、[`Result::or`]、[`Result::map_or`]和[`Result::unwrap_or`]有类似的替代方案。

[`Option::map_or`]: https://doc.rust-lang.org/std/option/enum.Option.html#method.map_or
[`Option::unwrap_or`]: https://doc.rust-lang.org/std/option/enum.Option.html#method.unwrap_or
[`Result::or`]: https://doc.rust-lang.org/std/result/enum.Result.html#method.or
[`Result::map_or`]: https://doc.rust-lang.org/std/result/enum.Result.html#method.map_or
[`Result::unwrap_or`]: https://doc.rust-lang.org/std/result/enum.Result.html#method.unwrap_or

## `Rc`/`Arc`

[`Rc::make_mut`]/[`Arc::make_mut`]提供了clone-on-write语义。它对`Rc`做了一个可改变的引用。如果refcount大于1，它将`clone`内部值以确保唯一的所有权；否则，它将修改原始值。它不经常需要，但偶尔会非常有用。
[**Example 1**](https://github.com/rust-lang/rust/pull/65198/commits/3832a634d3aa6a7c60448906e6656a22f7e35628),
[**Example 2**](https://github.com/rust-lang/rust/pull/65198/commits/75e0078a1703448a19e25eac85daaa5a4e6e68ac).

[`Rc::make_mut`]: https://doc.rust-lang.org/std/rc/struct.Rc.html#method.make_mut
[`Arc::make_mut`]: https://doc.rust-lang.org/std/sync/struct.Arc.html#method.make_mut

## `Mutex`, `RwLock`, `Condvar`, and `Once`

[`parking_lot`] crate提供了这些同步类型的替代实现。`parking_lot` 类型的API和语义与标准库中等效类型的类似但并非完全相同。

过去，`parking_lot` 版本通常比标准库中的版本更小、更快、更灵活，但在某些平台上，标准库版本已经有了很大改进。因此，在切换到 `parking_lot` 之前，您应该进行测量。

[`parking_lot`]: https://crates.io/crates/parking_lot

如果决定普遍使用 `parking_lot` 类型，很容易在某些地方意外地使用标准库的等效类型。您可以使用 [Clippy] 来避免这个问题。

[Clippy]: linting.md#disallowing-types
