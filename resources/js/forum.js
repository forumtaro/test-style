(function(){
    'use strict';
    
    const els = {
        private: document.getElementById('nav-private'),
        privateText: document.getElementById('nav-private-text'),
        bookmarks: document.getElementById('nav-bookmarks'),
        bookmarksText: document.getElementById('nav-bookmarks-text'),
        following: document.getElementById('nav-following'),
        loginBtn: document.getElementById('loginBtn'),
        mpc: document.getElementById('mpc')
    };
    
    // Скрол
    window.addEventListener('scroll', () => {
        document.body.classList.toggle('scrolled', window.scrollY > 100);
    }, {passive: true});
    
    function goTo(url){
        if(typeof app!=='undefined' && m && m.route) m.route.set(url);
        else window.location.href = url;
    }
    
    document.getElementById('mn').addEventListener('click', function(e){
        const link = e.target.closest('a[data-route]');
        if(link){e.preventDefault(); goTo(link.dataset.route);}
    });


document.getElementById('mpc').addEventListener('click', function(e){
    const link = e.target.closest('a[data-route]');
    if(link){e.preventDefault(); goTo(link.dataset.route);}
});
    
    function updateNav(){
        if(typeof app==='undefined') return;
        const u = app.session && app.session.user;
        
        if(u){
            // Зареєстровані користувачі
            els.private.dataset.route = '/conversations';
            els.private.href = '/private';
            els.privateText.textContent = 'Особисті';
            els.private.querySelector('i').className = 'fas fa-envelope';
            
            els.bookmarks.dataset.route = '/bookmarked-posts';
            els.bookmarks.href = '/bookmarked-posts';
            els.bookmarksText.textContent = 'Закладки';
            els.bookmarks.querySelector('i').className = 'fas fa-bookmark';
            
            els.following.dataset.route = '/following';
            els.following.href = '/following';
            els.following.innerHTML = '<i class="fas fa-star"></i><span>Підписки</span>';
        } else {
            // Незареєстровані користувачі
            els.private.dataset.route = '/d/149';
            els.private.href = '/d/149';
            els.privateText.textContent = 'Про нас';
            els.private.querySelector('i').className = 'fas fa-users';
            
            els.bookmarks.dataset.route = '/d/100-znacennya-kart-taro';
            els.bookmarks.href = '/d/100-znacennya-kart-taro';
            els.bookmarksText.textContent = 'Значення';
            els.bookmarks.querySelector('i').className = 'fas fa-scroll';
            
            els.following.dataset.route = '';
            els.following.href = '#';
            els.following.innerHTML = '<i class="fas fa-user-plus"></i><span>Реєстрація</span>';
        }
    }
    
    function init(){
        const s = document.querySelector('.App-header .item-session');
        if(typeof app!=='undefined' && app.session && app.session.user){
            if(s && els.mpc && !els.mpc.hasChildNodes()){
                els.mpc.appendChild(s.cloneNode(true));
                els.mpc.style.display = 'block';
                els.loginBtn.style.display = 'none';

              // Додаємо data-route до посилань профілю
    els.mpc.querySelectorAll('a').forEach(link => {
        if (link.href) link.dataset.route = link.getAttribute('href');
    });
            }
        } else {
            els.mpc.style.display = 'none';
            els.loginBtn.style.display = 'flex';
            els.loginBtn.onclick = () => {
                if(typeof app!=='undefined') app.modal.show(flarum.core.compat['forum/components/LogInModal']);
            };
        }
        updateNav();
    }
    
    const t = setInterval(() => {
        if(typeof app!=='undefined' && app.session){clearInterval(t); init();}
    }, 300);
    
    els.private.addEventListener('click', function(e){
        e.preventDefault();
        if(this.dataset.route) goTo(this.dataset.route);
    });
    
    els.bookmarks.addEventListener('click', function(e){
        e.preventDefault();
        if(this.dataset.route) goTo(this.dataset.route);
    });
    
    els.following.addEventListener('click', function(e){
        e.preventDefault();
        if(typeof app==='undefined') return;
        if(app.session && app.session.user){
            goTo('/following');
        } else {
            try {
                const SignUp = flarum.core.compat['forum/components/SignUpModal'];
                const LogIn = flarum.core.compat['forum/components/LogInModal'];
                app.modal.show(SignUp || LogIn);
            } catch(err){}
        }
    });
})();




















































(function() {
    'use strict';
    
    let notificationIcon = null;
    let notificationCount = null;
    let lastUnreadCount = -1;
    
    const excludedPaths = [
        '/notifications', 
        '/settings',
        /^\/d\/[^\/]+$/, 
        /^\/d\/[^\/]+\/\d*$/
    ];
    
    function isPathExcluded() {
        const path = window.location.pathname;
        return excludedPaths.some(p => 
            (typeof p === 'string' && p === path) || 
            (p instanceof RegExp && p.test(path))
        );
    }
    
    function isUserPage() {
        return /^\/u\/[^\/]+/.test(window.location.pathname);
    }
    
    function isUserLoggedIn() {
        return !!(window.app?.session?.user || 
                  document.querySelector('.App-header .item-session .Dropdown-toggle .Avatar') ||
                  document.querySelector('.Button[href="/settings"]'));
    }
    
    function shouldShowIcon() {
        if (!window.matchMedia('(max-width: 768px)').matches) return false;
        
        const loggedIn = isUserLoggedIn();
        
        if (loggedIn) {
            // Для зареєстрованих: не показувати на виключених шляхах І на сторінках користувача
            return !isPathExcluded() && !isUserPage();
        } else {
            // Для незареєстрованих: показувати скрізь крім виключених шляхів
            return !isPathExcluded();
        }
    }
    
    function createNotificationIcon() {
        removeNotificationIcon();
        
        if (!shouldShowIcon()) return;
        
        notificationIcon = document.createElement('div');
        notificationIcon.id = 'custom-notification-icon';
        notificationIcon.style.cssText = 'position:fixed;top:6px;right:6px;z-index:1000;padding:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;background-color:transparent';
        
        const loggedIn = isUserLoggedIn();
        
        if (loggedIn) {
            // Дзвіночок для зареєстрованих (не на сторінках користувача)
            const bell = document.createElement('i');
            bell.className = 'fas fa-bell';
            bell.style.cssText = 'color:var(--header-control-color);font-size:18px';
            
            notificationCount = document.createElement('span');
            notificationCount.className = 'notifications-badge';
            notificationCount.style.cssText = 'position:absolute;top:-1px;right:-3px;background:var(--primary-color);color:#fff;border-radius:20px;padding:3px 6px;font-size:10px;font-weight:700;min-width:16px;text-align:center;line-height:1.3;display:none;pointer-events:none';
            
            notificationIcon.appendChild(bell);
            notificationIcon.appendChild(notificationCount);
            
            notificationIcon.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (window.m && m.route) {
                    m.route.set('/notifications');
                } else {
                    window.location.href = '/notifications';
                }
            });
            
            updateNotificationCount();
        } else {
            // Іконка інфо для незареєстрованих (на всіх сторінках включаючи користувача)
            const info = document.createElement('i');
            info.className = 'fas fa-info';
            info.style.cssText = 'color:var(--header-control-color);font-size:19px';
            
            notificationIcon.appendChild(info);
            
            notificationIcon.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (window.m && m.route) {
                    m.route.set('/info');
                } else {
                    window.location.href = '/info';
                }
            });
        }
        
        document.body.appendChild(notificationIcon);
    }
    
    function removeNotificationIcon() {
        if (notificationIcon && notificationIcon.parentNode) {
            notificationIcon.remove();
        }
        notificationIcon = null;
        notificationCount = null;
        lastUnreadCount = -1;
    }
    
    function updateNotificationCount() {
        if (!notificationCount || !isUserLoggedIn()) return;
        
        try {
            if (window.app?.session?.user) {
                const count = window.app.session.user.unreadNotificationCount();
                updateBadge(count);
            }
        } catch(e) {
            setTimeout(() => {
                try {
                    if (notificationCount && window.app?.session?.user) {
                        const count = window.app.session.user.unreadNotificationCount();
                        updateBadge(count);
                    }
                } catch(e) {}
            }, 1000);
        }
    }
    
    function updateBadge(count) {
        if (!notificationCount || count === lastUnreadCount) return;
        
        lastUnreadCount = count;
        
        if (count > 0) {
            notificationCount.style.display = 'block';
            notificationCount.textContent = count > 99 ? '99+' : count;
        } else {
            notificationCount.style.display = 'none';
        }
    }
    
    function forceUpdate() {
        removeNotificationIcon();
        setTimeout(createNotificationIcon, 100);
    }
    
    function setupFlarumIntegration() {
        if (!window.app) return;
        
        if (window.m?.route) {
            const originalRoute = window.m.route.set;
            window.m.route.set = function() {
                const result = originalRoute.apply(this, arguments);
                setTimeout(forceUpdate, 100);
                return result;
            };
        }
        
        if (window.app.session) {
            window.app.session.on('login', () => {
                setTimeout(forceUpdate, 200);
            });
            window.app.session.on('logout', () => {
                setTimeout(forceUpdate, 200);
            });
        }
    }
    
    function initialCheck() {
        let checks = 0;
        const interval = setInterval(() => {
            forceUpdate();
            checks++;
            if (checks >= 10 || window.app?.session) {
                clearInterval(interval);
                if (window.app?.session) {
                    setupFlarumIntegration();
                }
            }
        }, 500);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initialCheck, 300);
        });
    } else {
        setTimeout(initialCheck, 300);
    }
    
    window.addEventListener('popstate', () => {
        setTimeout(forceUpdate, 200);
    });
    
    window.addEventListener('focus', () => {
        if (isUserLoggedIn()) {
            updateNotificationCount();
        } else {
            forceUpdate();
        }
    }, { passive: true });
    
    const observer = new MutationObserver(() => {
        if (!notificationIcon) {
            forceUpdate();
        }
    });
    
    observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });
    
})();




























(function() {
    // Функція для створення логотипа
    function createLogo() {
        const logoContainer = document.createElement('div');
        logoContainer.id = 'custom-logo-container';
        logoContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1001;
            
            
            transition: opacity 0.3s, transform 0.3s;
           
        `;
        
        const logo = document.createElement('a');
        logo.href = '/all';
        
        const img = document.createElement('img');
        img.src = 'https://mytaro.com.ua/logo.WebP';
        img.alt = 'Логотип';
        img.style.cssText = `
            max-width: 170px;
            height: auto;
            display: block;
        `;
        
        logo.appendChild(img);
        logoContainer.appendChild(logo);
        
        return logoContainer;
    }
    
    // Функція для показу/приховування елементів
    function handleScroll() {
        const logoContainer = document.getElementById('custom-logo-container');
        const scrubber = document.querySelector('.App-titleControl') || 
                         document.querySelector('.PostStreamScrubber');
        
        // Визначаємо, чи на сторінці дискусії
        const isDiscussionPage = document.querySelector('.DiscussionPage');
        
        if (!isDiscussionPage) {
            // Якщо не на сторінці дискусії - показуємо тільки логотип
            if (logoContainer) {
                logoContainer.style.opacity = '1';
                logoContainer.style.transform = 'translateX(-50%) translateY(0)';
            }
            if (scrubber) {
                scrubber.style.opacity = '0';
                scrubber.style.pointerEvents = 'none';
            }
            return;
        }
        
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const heroSection = document.querySelector('.DiscussionHero');
        const heroHeight = heroSection ? heroSection.offsetHeight : 200;
        
        if (scrollTop < heroHeight) {
            // Користувач на початку сторінки - показуємо логотип, ховаємо навігацію
            if (logoContainer) {
                logoContainer.style.opacity = '1';
                logoContainer.style.transform = 'translateX(-50%) translateY(0)';
            }
            if (scrubber) {
                scrubber.style.opacity = '0';
                scrubber.style.pointerEvents = 'none';
                scrubber.style.transition = 'opacity 0.3s';
            }
        } else {
            // Користувач прокрутив - ховаємо логотип, показуємо навігацію
            if (logoContainer) {
                logoContainer.style.opacity = '0';
                logoContainer.style.transform = 'translateX(-50%) translateY(-100%)';
            }
            if (scrubber) {
                scrubber.style.opacity = '1';
                scrubber.style.pointerEvents = 'auto';
                scrubber.style.transition = 'opacity 0.3s';
            }
        }
    }
    
    // Ініціалізація
    function init() {
        if (window.innerWidth <= 768) {
            // Додаємо логотип, якщо його немає
            if (!document.getElementById('custom-logo-container')) {
                const logoContainer = createLogo();
                document.body.appendChild(logoContainer);
            }
            
            // Додаємо обробник прокрутки
            window.addEventListener('scroll', handleScroll);
            
            // Початковий виклик
            handleScroll();
            
            // Спостерігач за змінами DOM (для SPA навігації Flarum)
            const observer = new MutationObserver(function() {
                handleScroll();
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }
    
    // Запуск після завантаження сторінки
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Обробка зміни розміру вікна
    window.addEventListener('resize', function() {
        const logoContainer = document.getElementById('custom-logo-container');
        
        if (window.innerWidth <= 768) {
            if (!logoContainer) {
                const newLogo = createLogo();
                document.body.appendChild(newLogo);
                window.addEventListener('scroll', handleScroll);
                handleScroll();
            }
        } else {
            if (logoContainer) {
                logoContainer.remove();
                window.removeEventListener('scroll', handleScroll);
            }
        }
    });
})();
















(function() {
    let startY = 0, currentY = 0, isDragging = false, canClose = false;
    let currentDropdown = null, dropdownIsOpen = false;
    let xStart = null, yStart = null, xDiff = 0, yDiff = 0;
    let isSwiping = false, hasReachedThreshold = false;

    const SWIPE_RIGHT = 200, SWIPE_LEFT = -140, SWIPE_IGNORE = 90;

    // ===== DROPDOWN SWIPE =====

    function setupDropdowns() {
        document.querySelectorAll('.Dropdown-menu').forEach(dd => {
            if (dd.dataset.swipeInit) return;
            dd.dataset.swipeInit = '1';

            if (!dd.querySelector('.swipe-indicator')) {
                const ind = document.createElement('div');
                ind.className = 'swipe-indicator';
                dd.insertBefore(ind, dd.firstChild);
            }

            dd.style.borderRadius = '23px 23px 0 0';

            dd.addEventListener('touchstart', e => onDragStart(dd, e.touches[0].clientY), { passive: false });
            dd.addEventListener('touchmove', e => {
                if (e.target.closest('.Scrubber-scrollbar') || e.target.closest('.mobile-nav-menu')) return;
                const delta = e.touches[0].clientY - startY;
                if (delta > 0 && canClose) {
                    e.preventDefault();
                    applyDrag(dd, delta);
                }
            }, { passive: false });
            dd.addEventListener('touchend', () => onDragEnd(dd), { passive: true });

            dd.addEventListener('mousedown', e => {
                if (e.target.closest('.mobile-nav-menu') || e.target.closest('.Scrubber-scrollbar')) return;
                onDragStart(dd, e.clientY);
                const onMove = e2 => {
                    const delta = e2.clientY - startY;
                    if (delta > 0 && canClose) applyDrag(dd, delta);
                };
                const onUp = () => {
                    onDragEnd(dd);
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            });
        });
    }

    function onDragStart(dd, y) {
        startY = currentY = y;
        isDragging = true;
        canClose = dd.scrollTop === 0;
        currentDropdown = dd;
        if (canClose) dd.style.transition = 'none';
    }

    function applyDrag(dd, delta) {
        currentY = startY + delta;
        const progress = Math.min(delta / 150, 1);
        const r = Math.max(8, 16 - progress * 8);
        dd.style.transform = `translateY(${delta}px)`;
        dd.style.opacity = Math.max(0.3, 1 - progress);
        dd.style.borderRadius = `${r}px ${r}px 0 0`;
    }

    function onDragEnd(dd) {
        if (!isDragging) return;
        const delta = currentY - startY;

        if (delta > 80 && canClose) {
            dd.style.transform = 'translateY(100vh)';
            dd.style.opacity = '0';
            dd.style.borderRadius = '8px 8px 0 0';
            dd.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

            setTimeout(() => {
                document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                dropdownIsOpen = false;
                setTimeout(() => {
                    dd.style.transform = '';
                    dd.style.opacity = '';
                    dd.style.transition = '';
                    dd.style.borderRadius = '16px 16px 0 0';
                }, 50);
            }, 300);
        } else {
            dd.style.transform = '';
            dd.style.opacity = '';
            dd.style.borderRadius = '16px 16px 0 0';
            dd.style.transition = 'all 0.2s ease';
            setTimeout(() => { dd.style.transition = ''; }, 200);
        }

        isDragging = false;
        currentDropdown = null;
    }

    document.addEventListener('click', e => {
        if (!e.target.closest('.Dropdown-menu') && !e.target.closest('[data-toggle="dropdown"]') && !e.target.closest('.Dropdown-toggle')) {
            dropdownIsOpen = false;
        }
    }, true);

    // ===== NAVIGATION SWIPE =====

    document.addEventListener('touchstart', e => {
        if (dropdownIsOpen) return;
        if (e.target.closest('.Dropdown-toggle,.navigation,.modal,.Dropdown-menu,button,textarea,input')) return;
        xStart = e.touches[0].clientX;
        yStart = e.touches[0].clientY;
        isSwiping = true;
        hasReachedThreshold = false;
    }, { passive: true });

    document.addEventListener('touchmove', e => {
        if (dropdownIsOpen || !xStart || !isSwiping) return;
        xDiff = e.touches[0].clientX - xStart;
        yDiff = e.touches[0].clientY - yStart;
        if (Math.abs(xDiff) < Math.abs(yDiff) || Math.abs(xDiff) < SWIPE_IGNORE) return;

        const contents = document.querySelectorAll('.App-content');
        if (xDiff > 0) {
            contents.forEach(c => {
                c.style.transform = `translateX(${xDiff}px)`;
                c.style.opacity = 1 - Math.abs(xDiff) / (2 * SWIPE_RIGHT);
            });
            if (xDiff > SWIPE_RIGHT) {
                hasReachedThreshold = true;
                contents.forEach(c => c.classList.add('permanently-swiped'));
            }
        } else if (xDiff < 0 && window.location.pathname === '/') {
            contents.forEach(c => {
                c.style.transform = `translateX(${xDiff}px) rotateY(${xDiff / 10}deg)`;
                c.style.opacity = 1 - Math.abs(xDiff) / 500;
            });
            if (Math.abs(xDiff) > Math.abs(SWIPE_LEFT)) {
                hasReachedThreshold = true;
                contents.forEach(c => c.classList.add('permanently-swiped'));
            }
        }
    }, { passive: true });

    document.addEventListener('touchend', () => {
        if (dropdownIsOpen || !isSwiping) return;

        const contents = document.querySelectorAll('.App-content');

        if (hasReachedThreshold) {
            if (xDiff > 0) {
                document.querySelector('.Button-label')?.click();
                setTimeout(() => contents.forEach(c => {
                    c.classList.remove('swiped', 'permanently-swiped');
                    c.style.transform = '';
                    c.style.opacity = '';
                }), 300);

            } else if (xDiff < 0 && window.location.pathname === '/') {
                contents.forEach(c => {
                    c.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease-out';
                    c.style.transform = 'translateX(-100%) rotateY(-15deg)';
                    c.style.opacity = '0';
                });

                if (typeof m !== 'undefined' && m.route) m.route.set('/all');

                setTimeout(() => {
                    const newContents = document.querySelectorAll('.App-content');
                    newContents.forEach(c => {
                        c.style.transition = '';
                        c.style.transform = 'translateY(100px)';
                        c.style.opacity = '0';
                    });
                    setTimeout(() => {
                        newContents.forEach(c => {
                            c.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease-out';
                            c.style.transform = 'translateY(0)';
                            c.style.opacity = '1';
                        });
                        setTimeout(() => newContents.forEach(c => {
                            c.style.transition = '';
                            c.style.transform = '';
                            c.style.opacity = '';
                        }), 500);
                    }, 50);
                }, 400);
            }
        } else {
            contents.forEach(c => {
                c.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
                c.style.transform = '';
                c.style.opacity = '';
            });
        }

        isSwiping = false;
        xStart = yStart = null;
    }, { passive: true });

    // ===== OBSERVER =====

    let rafPending = false;
    const observer = new MutationObserver(() => {
        if (rafPending) return;
        rafPending = true;
        requestAnimationFrame(() => { setupDropdowns(); rafPending = false; });
    });

    function start() {
        if (!document.body) { setTimeout(start, 50); return; }
        setupDropdowns();
        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})();


























(function() {
    function expandMobileNav() {
        if (window.innerWidth > 767) return;
        
        const userPage = document.querySelector('.UserPage');
        if (!userPage) return;
        
        const navDropdown = document.querySelector('.item-nav .Dropdown');
        if (!navDropdown) return;
        
        const menu = navDropdown.querySelector('.Dropdown-menu');
        const toggle = navDropdown.querySelector('.Dropdown-toggle');
        
        if (menu && toggle) {
            const links = menu.querySelectorAll('a');
            
            const buttonsContainer = document.createElement('div');
            buttonsContainer.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;padding:8px 0;justify-content:center;';
            
            links.forEach(link => {
                if (link.closest('.Dropdown-separator')) return;
                
                const newLink = document.createElement('a');
                newLink.href = link.href;
                newLink.style.cssText = 'display:inline-flex;align-items:center;gap:4px;padding:6px 12px;border:1px solid #ccc;border-radius:16px;font-size:13px;text-decoration:none;color:var(--code-color);background:var(--hero-bg);cursor:pointer;';
                newLink.innerHTML = link.innerHTML;
                
                if (link.parentElement.classList.contains('active')) {
                    newLink.style.background = 'var(--hero-bg)';
                    newLink.style.color = 'var(--tag-color)';
                    newLink.style.borderColor = 'var(--tag-color)';
                }
                
                newLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    const path = new URL(this.href).pathname;
                    if (typeof m !== 'undefined' && m.route) m.route.set(path);
                    else {
                        window.history.pushState({}, '', path);
                        window.dispatchEvent(new PopStateEvent('popstate'));
                    }
                });
                
                buttonsContainer.appendChild(newLink);
            });
            
            navDropdown.parentElement.replaceChild(buttonsContainer, navDropdown);
        }
    }
    
    setTimeout(expandMobileNav, 300);
    setTimeout(expandMobileNav, 1000);
    
    const observer = new MutationObserver(() => setTimeout(expandMobileNav, 300));
    observer.observe(document.body, { childList: true, subtree: true });
})();




































document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    const processed = new WeakSet();
    
    function processQuotes() {
        document.querySelectorAll('blockquote').forEach(quote => {
            if (processed.has(quote)) return;
            processed.add(quote);
            
            if (quote.scrollHeight > 80) {
                quote.classList.add('collapsible');
                
                const btn = document.createElement('button');
                btn.className = 'quote-toggle';
                btn.textContent = 'Показати повністю';
                
                btn.onclick = function(e) {
                    e.stopPropagation();
                    const expanded = quote.classList.toggle('expanded');
                    btn.textContent = expanded ? 'Згорнути' : 'Показати повністю';
                };
                
                quote.appendChild(btn);
            }
        });
    }
    
    processQuotes();
    
    // Для Flarum — спостерігач за змінами DOM
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(processQuotes);
        observer.observe(document.body, { childList: true, subtree: true });
    }
})();
