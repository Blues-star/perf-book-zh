# 哈希

`HashSet` 和 `HashMap` 是两种广泛使用的类型。默认的哈希算法没有指定，但在撰写本文时，默认算法是一种称为 [SipHash 1-3] 的算法。这个算法质量很高——它提供了很高的碰撞保护，但对于短键（如整数）来说相对较慢。

[SipHash 1-3]: https://en.wikipedia.org/wiki/SipHash

如果测试显示hash是关键部分，而[HashDoS attacks]并不是你的应用所关心的问题，那么使用具有更快的散列算法的散列表可以提供很大的速度优势。
- [`rustc-hash`]提供了 "FxHashSet "和 "FxHashMap "类型，它们是 "HashSet "和 "HashMap "的替代物。它的散列算法质量不高，但速度非常快，特别是对整数键而言，并且发现它的性能优于rustc内的所有其他散列算法。
- [`fnv`]提供了`FnvHashSet`和`FnvHashMap`类型。其散列算法比`fxhash`的质量高，但速度稍慢。
- [`ahash`]提供`AHashSet`和`AHashMap`。它的哈希算法可以采取一些处理器上的AES指令支持的优势。

[HashDoS attacks]: https://en.wikipedia.org/wiki/Collision_attack
[`rustc-hash`]: https://crates.io/crates/rustc-hash
[`fnv`]: https://crates.io/crates/fnv
[`ahash`]: https://crates.io/crates/ahash

如果散列性能在你的程序中很重要，那么值得尝试以上几种选择。例如，在rustc中看到以下结果。
- 从 `fnv`切换到 `rustc-hash` 的结果是[速度提高了6%][fnv2fx]。
- 试图从`rustc-hash`切换到`ahash`的结果是[减速1-4%][fx2a]。
- 试图从`rustc-hash`切换回默认的哈希，结果是[速度减慢了4-84%][fx2default]!

[fnv2fx]: https://github.com/rust-lang/rust/pull/37229/commits/00e48affde2d349e3b3bfbd3d0f6afb5d76282a7
[fx2a]: https://github.com/rust-lang/rust/issues/69153#issuecomment-589504301
[fx2default]: https://github.com/rust-lang/rust/issues/69153#issuecomment-589338446

如果您决定普遍使用替代方案之一，比如 `FxHashSet`/`FxHashMap`，很容易在某些地方意外地使用 `HashSet`/`HashMap`。您可以使用 [Clippy] 来避免这个问题。

有些类型不需要哈希。例如，您可能有一个包装整数的新类型，而整数值是随机的，或者接近随机的。对于这种类型，哈希值的分布与值本身的分布并没有太大不同。在这种情况下，[`nohash_hasher`] crate 可能会有用。

哈希函数设计是一个复杂的主题，超出了本书的范围。[`ahash` 文档] 中有很好的讨论。

[Clippy]: linting.md#disallowing-types
[`nohash_hasher`]: https://crates.io/crates/nohash-hasher
[`ahash` 文档]: https://github.com/tkaitchuck/aHash/blob/master/compare/readme.md
