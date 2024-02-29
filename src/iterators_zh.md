# Iterators

## `collect`

[`Iterator::collect`]将一个迭代器转换为一个集合，如`Vec`，它通常需要一个分配。如果该集合只是再次迭代，你应该避免调用`collect`。

[`Iterator::collect`]: https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.collect

出于这个原因，从函数中返回一个迭代器类型，比如`impl Iterator<Item=T>`，往往比`Vec<T>`更好。请注意，有时这些返回类型需要额外的生存期，正如[this post]所解释的那样。
[**Example**](https://github.com/rust-lang/rust/pull/77990/commits/660d8a6550a126797aa66a417137e39a5639451b).

[this post]: https://blog.katona.me/2019/12/29/Rust-Lifetimes-and-Iterators/

同样，你可以使用[`extend`]用迭代器扩展一个现有的集合（如`Vec`），而不是将迭代器收集到`Vec`中，然后使用[`append`]。

[`extend`]: https://doc.rust-lang.org/std/iter/trait.Extend.html#tymethod.extend
[`append`]: https://doc.rust-lang.org/std/vec/struct.Vec.html#method.append

最后，当编写迭代器时，如果可能的话，实现 [`Iterator::size_hint`] 或 [`ExactSizeIterator::len`] 方法通常是值得的。使用该迭代器的 `collect` 和 `extend` 调用可能会减少分配，因为它们提前了解迭代器产生的元素数量信息。

[`Iterator::size_hint`]: https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.size_hint
[`ExactSizeIterator::len`]: https://doc.rust-lang.org/std/iter/trait.ExactSizeIterator.html#method.len

## Chaining

[`chain`]可以非常方便，但也可能比单个迭代器慢。如果可能的话，热迭代器可能值得避免。
[**Example**](https://github.com/rust-lang/rust/pull/64801/commits/5ca99b750e455e9b5e13e83d0d7886486231e48a).

类似地，[`filter_map`]可能比使用[`filter`]和[`map`]更快。

[`chain`]: https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.chain
[`filter_map`]: https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.filter_map
[`filter`]: https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.filter
[`map`]: https://doc.rust-lang.org/std/iter/trait.Iterator.html#method.map

## Chunks

当需要一个分块迭代器，并且已知分块大小恰好能整除切片长度时，应该使用更快的 [`slice::chunks_exact`] 而不是 [`slice::chunks`]。

当分块大小不确定能否恰好整除切片长度时，仍然可以更快地使用 `slice::chunks_exact`，结合 [`ChunksExact::remainder`] 或手动处理多余元素。
[**Example 1**](https://github.com/johannesvollmer/exrs/pull/173/files),
[**Example 2**](https://github.com/johannesvollmer/exrs/pull/175/files).

同样适用于相关的迭代器:
- [`slice::rchunks`], [`slice::rchunks_exact`], and [`RChunksExact::remainder`];
- [`slice::chunks_mut`], [`slice::chunks_exact_mut`], and [`ChunksExactMut::into_remainder`];
- [`slice::rchunks_mut`], [`slice::rchunks_exact_mut`], and [`RChunksExactMut::into_remainder`].

[`slice::chunks`]: https://doc.rust-lang.org/stable/std/primitive.slice.html#method.chunks
[`slice::chunks_exact`]: https://doc.rust-lang.org/stable/std/primitive.slice.html#method.chunks_exact
[`ChunksExact::remainder`]: https://doc.rust-lang.org/stable/std/slice/struct.ChunksExact.html#method.remainder

[`slice::rchunks`]: https://doc.rust-lang.org/stable/std/primitive.slice.html#method.rchunks
[`slice::rchunks_exact`]: https://doc.rust-lang.org/stable/std/primitive.slice.html#method.rchunks_exact
[`RChunksExact::remainder`]: https://doc.rust-lang.org/stable/std/slice/struct.RChunksExact.html#method.remainder

[`slice::chunks_mut`]: https://doc.rust-lang.org/stable/std/primitive.slice.html#method.chunks_mut
[`slice::chunks_exact_mut`]: https://doc.rust-lang.org/stable/std/primitive.slice.html#method.chunks_exact_mut
[`ChunksExactMut::into_remainder`]: https://doc.rust-lang.org/stable/std/slice/struct.ChunksExactMut.html#method.into_remainder

[`slice::rchunks_mut`]: https://doc.rust-lang.org/stable/std/primitive.slice.html#method.rchunks_mut
[`slice::rchunks_exact_mut`]: https://doc.rust-lang.org/stable/std/primitive.slice.html#method.rchunks_exact_mut
[`RChunksExactMut::into_remainder`]: https://doc.rust-lang.org/stable/std/slice/struct.RChunksExactMut.html#method.into_remainder

