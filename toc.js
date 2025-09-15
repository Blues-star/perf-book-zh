// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded affix "><a href="title-page.html">Title Page</a></li><li class="chapter-item expanded "><a href="introduction_zh.html"><strong aria-hidden="true">1.</strong> 简介</a></li><li class="chapter-item expanded "><a href="benchmarking_zh.html"><strong aria-hidden="true">2.</strong> 基准分析</a></li><li class="chapter-item expanded "><a href="build-configuration_zh.html"><strong aria-hidden="true">3.</strong> 构建配置</a></li><li class="chapter-item expanded "><a href="linting_zh.html"><strong aria-hidden="true">4.</strong> Linting</a></li><li class="chapter-item expanded "><a href="profiling_zh.html"><strong aria-hidden="true">5.</strong> Profiling</a></li><li class="chapter-item expanded "><a href="inlining_zh.html"><strong aria-hidden="true">6.</strong> 初始化</a></li><li class="chapter-item expanded "><a href="hashing_zh.html"><strong aria-hidden="true">7.</strong> 哈希</a></li><li class="chapter-item expanded "><a href="heap-allocations_zh.html"><strong aria-hidden="true">8.</strong> 堆分配</a></li><li class="chapter-item expanded "><a href="type-sizes_zh.html"><strong aria-hidden="true">9.</strong> 类型大小</a></li><li class="chapter-item expanded "><a href="standard-library-types_zh.html"><strong aria-hidden="true">10.</strong> 标准库类型</a></li><li class="chapter-item expanded "><a href="iterators_zh.html"><strong aria-hidden="true">11.</strong> 迭代器</a></li><li class="chapter-item expanded "><a href="bounds-checks_zh.html"><strong aria-hidden="true">12.</strong> 边界检查</a></li><li class="chapter-item expanded "><a href="io_zh.html"><strong aria-hidden="true">13.</strong> I/O</a></li><li class="chapter-item expanded "><a href="logging-and-debugging_zh.html"><strong aria-hidden="true">14.</strong> 日志和调试</a></li><li class="chapter-item expanded "><a href="wrapper-types_zh.html"><strong aria-hidden="true">15.</strong> 封装类型</a></li><li class="chapter-item expanded "><a href="machine-code_zh.html"><strong aria-hidden="true">16.</strong> 机器码</a></li><li class="chapter-item expanded "><a href="parallelism_zh.html"><strong aria-hidden="true">17.</strong> 并行</a></li><li class="chapter-item expanded "><a href="general-tips_zh.html"><strong aria-hidden="true">18.</strong> 一般提示</a></li><li class="chapter-item expanded "><a href="compile-times_zh.html"><strong aria-hidden="true">19.</strong> 编译时间</a></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString().split("#")[0].split("?")[0];
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
