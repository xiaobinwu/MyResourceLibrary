// 顶部导航封装（吸附）
const StickyUtil = {
    getOffset(ele) {
        let top = 0;
        let left = 0;
        while (ele) {
            top += ele.offsetTop;
            left += ele.offsetLeft;
            ele = ele.offsetParent;
        }
        return {
            top,
            left
        };
    },
    getScrollPos() {
        return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
    },
};

class Sticky {
    // 构造函数
    constructor(params) {
        const opts = Object.assign({
            nav: document.querySelector('#act-nav'), // nav
            navItem: '.act-nav-item', // nav item className
            navFixedClassName: 'nav-fixed', // nav fixed时的className
            section: '.section', // 模块元素
            diff: 0, // 偏移量，有多个fixed元素时使用，不使用stickyDom
            stickyDom: null // 单个fixed元素时可使用
        }, params);
        this.navOffset = 0; // 记录初始偏移值
        this.stickyDomDiff = 0; // 吸附元素为fixed时的偏差
        this.$stickyDom = opts.stickyDom; // 吸附fixed元素
        this.isTapScroll = false; // 点击nav时滚动标志位
        this.$nav = opts.nav;
        this.diff = opts.diff;
        this.$navItem = document.querySelectorAll(opts.navItem);
        this.$section = document.querySelectorAll(opts.section);
        this.sectionsOffset = [];
        this.navFixedClassName = opts.navFixedClassName;
    }

    init() {
        this.setIndex();
        this.bind();
        const elemChild = this.$nav.childNodes;
        for (let i = 0; i < elemChild.length; i++) {
            if (elemChild[i].nodeName === '#text' && !/\S/.test(elemChild[i].nodeValue)) {
                // 删除数组中的text
                this.$nav.removeChild(elemChild[i]);
            }
        }
    }

    setIndex() {
        for (let i = 0; i < this.$navItem.length; i++) { 
            this.$navItem[i].setAttribute('index', i);
        }
    }

    hasStickyDom() {
        this.stickyDomDiff = this.getStickyDomOffset();
        this.$nav.style.top = `${this.stickyDomDiff}px`;
    }

    getStickyDomOffset() {
        return this.$stickyDom ? (StickyUtil.getOffset(this.$stickyDom).top + this.$stickyDom.offsetHeight) : (this.diff !== 0 ? this.diff : 0); 
    }

    navAddClass(index) {
        for (let i = this.$navItem.length - 1; i >= 0; i--) { 
            if (this.$navItem[i].classList.contains('active') || typeof index === 'undefined') {
                this.$navItem[i].classList.remove('active');
            }
        }
        if (typeof index !== 'undefined') {
            this.$navItem[index].classList.add('active');
            const left = StickyUtil.getOffset(this.$navItem[index]).left;
            if (this.$nav.firstChild.scrollTo) {
                this.$nav.firstChild.scrollTo({ behavior: 'smooth', left: left }); 
            } else {
                this.$nav.firstChild.scrollLeft = left;
            }
        }
    }

    bind() {
        let scrollTop = StickyUtil.getScrollPos();
        if (scrollTop > this.navOffset - this.stickyDomDiff) {
            this.$nav.classList.add(this.navFixedClassName);
        } else {
            this.$nav.classList.remove(this.navFixedClassName);
        }
        this.hasStickyDom();
        const navHeight = this.$nav.offsetHeight;
        this.updateSectionOffset();
        window.onscroll = (e) => {
            scrollTop = StickyUtil.getScrollPos();
            const navTop = StickyUtil.getOffset(this.$nav);
            if (!this.navOffset) {
                this.navOffset = navTop.top;
            }
            if (scrollTop > this.navOffset - this.stickyDomDiff) {
                this.$nav.classList.add(this.navFixedClassName);
            } else {
                this.$nav.classList.remove(this.navFixedClassName);
                this.navAddClass(0);
            }
            // TODO
            if (!this.isTapScroll) {
                for (let i = 0; i < this.$section.length; i++) { 
                    const scrollPos = StickyUtil.getScrollPos();
                    const diff = navHeight * 2 + this.stickyDomDiff; 
                    // scrollTop在0至i-1个时处理逻辑
                    if ((this.sectionsOffset[i] - diff) < scrollPos && scrollPos < (this.sectionsOffset[i+1] - diff)) { 
                        this.navAddClass(i);
                    }
                    // scrollTop在i===_self.$section.length - 1时处理逻辑
                    if (this.sectionsOffset[this.$section.length - 1] - diff < scrollPos) {
                        this.navAddClass(this.$section.length - 1);
                    }
                }
            }
        }; 
        this.$nav.onclick = (e) => {
            const that = this;
            const ev = e || window.event;
            const target = ev.target.parentNode || ev.srcElement.parentNode;
            let index = $(target).attr('index');
            if (index || index === 0) {
                index = parseInt(index); 
                this.navAddClass(index);
                let top = 0;
                if (this.isNavFixed()) {
                    top = StickyUtil.getOffset(this.$section[index]).top - this.stickyDomDiff - this.$nav.offsetHeight; 
                } else {
                    top = StickyUtil.getOffset(this.$section[index]).top - this.stickyDomDiff - 2 * this.$nav.offsetHeight; 
                }
                const left = StickyUtil.getOffset(target).left; 
                window.scrollTo(0, top); 
                if (this.$nav.firstChild.scrollTo) {
                    this.$nav.firstChild.scrollTo({ behavior: 'smooth', left: left }); 
                } else {
                    this.$nav.firstChild.scrollLeft = left;
                }
                this.isTapScroll = true;
                setTimeout((params) => {
                    that.isTapScroll = false;
                }, 500);
            }
        };
    }

    updateSectionOffset() {
        for (let i = 0; i < this.$section.length; i++) { 
            this.sectionsOffset.push(StickyUtil.getOffset(this.$section[i]).top);
        }
    }

    isNavFixed() {
        // 有兼容性
        return this.$nav.classList.contains(this.navFixedClassName);
    }

}

export default Sticky;
