# 编译时间

虽然本书的主要内容是提高Rust程序的性能，但本节的内容是关于减少Rust程序的编译时间，因为这是很多人感兴趣的相关话题。

[减少编译时间]部分讨论了通过构建配置选择来减少编译时间的方法。本节的其余部分将讨论需要修改程序代码来减少编译时间的方法。

[减少编译时间]: build-configuration.md#minimizing-compile-times

## 可视化

Rust编译器有一个功能，可以让你可视化编译你的程序。用这个命令进行编译。
```text
cargo build --timings
```
完成后，它将打印一个HTML文件的名称。在Web浏览器中打开该文件。其中包含一个[Gantt chart]，显示程序中各个crate之间的依赖关系。这显示了您的crate图中有多少并行性，这可以表明是否应该拆分任何序列化编译的大型crate。有关如何阅读这些图表的更多详细信息，请参阅[timings]。

[Gantt chart]: https://en.wikipedia.org/wiki/Gantt_chart
[timings]: https://doc.rust-lang.org/nightly/cargo/reference/timings.html

## LLVM IR

Rust编译器的后端使用[LLVM]。LLVM的执行会占到编译时间的很大一部分，尤其是当Rust编译器的前端会产生大量的[IR]，这需要LLVM花很长的时间去优化。

[LLVM]: https://llvm.org/
[IR]: https://en.wikipedia.org/wiki/Intermediate_representation

这些问题可以用[`cargo llvm-line`]来诊断，它显示了哪些Rust函数导致了最多的LLVM IR生成。通用函数通常是最重要的函数，因为它们在大型程序中可以被实例化几十次甚至几百次。

[`cargo llvm-lines`]: https://github.com/dtolnay/cargo-llvm-lines/

如果一个通用函数导致IR膨胀，有几种方法可以解决。最简单的方法就是把函数变小。
[**Example 1**](https://github.com/rust-lang/rust/pull/72166/commits/5a0ac0552e05c079f252482cfcdaab3c4b39d614),
[**Example 2**](https://github.com/rust-lang/rust/pull/91246/commits/f3bda74d363a060ade5e5caeb654ba59bfed51a4).

另一种方法是将函数的非泛型部分移动到一个单独的非泛型函数中，该函数只会被实例化一次。是否可能取决于泛型函数的细节。当可能时，非泛型函数通常可以被整洁地编写为泛型函数内部的内部函数，就像[`std::fs::read`]的代码所示：
```rust,ignore
pub fn read<P: AsRef<Path>>(path: P) -> io::Result<Vec<u8>> {
    fn inner(path: &Path) -> io::Result<Vec<u8>> {
        let mut file = File::open(path)?;
        let size = file.metadata().map(|m| m.len()).unwrap_or(0);
        let mut bytes = Vec::with_capacity(size as usize);
        io::default_read_to_end(&mut file, &mut bytes)?;
        Ok(bytes)
    }
    inner(path.as_ref())
}
```
[`std::fs::read`]: https://doc.rust-lang.org/std/fs/fn.read.html

[**Example**](https://github.com/rust-lang/rust/pull/72013/commits/68b75033ad78d88872450a81745cacfc11e58178).

有时，像[`Option::map`]和[`Result::map_err`]这样的常用实用函数会被实例化多次。 用等价的`match`表达式替换它们可以帮助编译时间。

[`Option::map`]: https://doc.rust-lang.org/std/option/enum.Option.html#method.map
[`Result::map_err`]: https://doc.rust-lang.org/std/result/enum.Result.html#method.map_err

这些变化对编译时间的影响通常是很小的，但偶尔也会很大。
[**Example**](https://github.com/servo/servo/issues/26585).

这些更改还可以减少二进制文件的大小。