# Machine Code

当你有一小段非常频繁执行的热点代码时，值得检查生成的机器代码，看看是否存在一些低效之处，比如可移除的[边界检查]。在处理小片段时，[Compiler Explorer] 网站是一个很好的资源。而 [`cargo-show-asm`] 则是另一个工具，可以用于完整的 Rust 项目。

[边界检查]: https://en.wikipedia.org/wiki/Bounds_checking
[Compiler Explorer]: https://godbolt.org/
[`cargo-show-asm`]: https://github.com/thephoeron/cargo-show-asm

与此相关的是，[`core::arch`]模块提供了对特定架构的固有知识的访问，其中许多与SIMD指令有关。

[`core::arch`]: https://doc.rust-lang.org/core/arch/index.html


