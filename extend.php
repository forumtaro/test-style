<?php

namespace ForumTaro\Theme;

use Flarum\Extend;
use Flarum\Frontend\Document;

return [
    (new Extend\Frontend('forum'))
        ->css(__DIR__ . '/resources/less/forum/extension.less')
        ->content(function (Document $document) {

            $document->foot[] = '
            <div class="mobile-profile-container" id="mpc" style="display:none"></div>
            <button class="login-mobile-btn" id="loginBtn" title="Увійти" style="display:none">
                <i class="fas fa-sign-in-alt"></i>
            </button>
            <div class="mobile-nav" id="mn">
                <a href="/tags" data-route="/tags"><i class="fas fa-th-list"></i><span>Категорії</span></a>
                <a href="#" id="nav-private"><i class="fas fa-fire"></i><span id="nav-private-text">Популярне</span></a>
                <a href="/all" data-route="/all"><i class="fas fa-comments"></i><span>Сторінки</span></a>
                <a href="#" id="nav-bookmarks"><i class="fas fa-book-open"></i><span id="nav-bookmarks-text">Значення</span></a>
                <a href="#" id="nav-following"><i class="fas fa-user-plus"></i><span id="nav-following-text">Реєстрація</span></a>
            </div>';

            $document->foot[] = '<script>
(function(){
    "use strict";

    function $(id){ return document.getElementById(id); }
    function goTo(url){
        if(typeof m!=="undefined"&&m.route) m.route.set(url);
        else window.location.href=url;
    }
    function debounce(fn,ms){ var t; return function(){ clearTimeout(t); t=setTimeout(fn,ms); }; }
    function observe(target,fn,ms,opts){
        new MutationObserver(ms?debounce(fn,ms):fn).observe(target,opts||{childList:true,subtree:true});
    }

    window.addEventListener("scroll",function(){ document.body.classList.toggle("scrolled",window.scrollY>100); },{passive:true});

    var mn=$("mn"), mpc=$("mpc"), loginBtn=$("loginBtn");
    if(mn) mn.addEventListener("click",function(e){ var l=e.target.closest("a[data-route]"); if(l){e.preventDefault();goTo(l.dataset.route);} });
    if(mpc) mpc.addEventListener("click",function(e){ var l=e.target.closest("a[data-route]"); if(l){e.preventDefault();goTo(l.dataset.route);} });

    function updateNav(){
        if(typeof app==="undefined") return;
        var u=app.session&&app.session.user;
        var pl=$("nav-private"),pt=$("nav-private-text"),bl=$("nav-bookmarks"),bt=$("nav-bookmarks-text"),fl=$("nav-following");
        if(u){
            if(pl){pl.dataset.route="/conversations";pl.href="/private";pl.querySelector("i").className="fas fa-envelope";}
            if(pt) pt.textContent="Особисті";
            if(bl){bl.dataset.route="/bookmarked-posts";bl.href="/bookmarked-posts";bl.querySelector("i").className="fas fa-bookmark";}
            if(bt) bt.textContent="Закладки";
            if(fl){fl.dataset.route="/following";fl.href="/following";fl.innerHTML="<i class=\"fas fa-star\"></i><span>Підписки</span>";}
        } else {
            if(pl){pl.dataset.route="/?sort=popular";pl.href="/?sort=popular";pl.querySelector("i").className="fas fa-fire";}
            if(pt) pt.textContent="Популярне";
            if(bl){bl.dataset.route="/d/100-znacennya-kart-taro";bl.href="/d/100-znacennya-kart-taro";bl.querySelector("i").className="fas fa-book-open";}
            if(bt) bt.textContent="Значення";
            if(fl){fl.href="#";fl.innerHTML="<i class=\"fas fa-user-plus\"></i><span>Реєстрація</span>";}
        }
        if(pl) pl.onclick=function(e){e.preventDefault();if(pl.dataset.route)goTo(pl.dataset.route);};
        if(bl) bl.onclick=function(e){e.preventDefault();if(bl.dataset.route)goTo(bl.dataset.route);};
        if(fl) fl.onclick=function(e){
            e.preventDefault();
            if(typeof app==="undefined") return;
            if(app.session&&app.session.user){ goTo("/following"); }
            else { try{ var S=flarum.core.compat["forum/components/SignUpModal"],L=flarum.core.compat["forum/components/LogInModal"]; app.modal.show(S||L); }catch(err){} }
        };
    }

    function initProfile(){
        if(typeof app==="undefined") return;
        var u=app.session&&app.session.user;
        if(u){
            var s=document.querySelector(".App-header .item-session");
            if(s&&mpc&&!mpc.hasChildNodes()){
                mpc.appendChild(s.cloneNode(true));
                mpc.style.display="block";
                if(loginBtn) loginBtn.style.display="none";
                mpc.querySelectorAll("a").forEach(function(l){ if(l.href) l.dataset.route=l.getAttribute("href"); });
            }
        } else {
            if(mpc) mpc.style.display="none";
            if(loginBtn){ loginBtn.style.display="flex"; loginBtn.onclick=function(){ if(typeof app!=="undefined") app.modal.show(flarum.core.compat["forum/components/LogInModal"]); }; }
        }
    }

    function initNotifications(){
        var excl=["/notifications","/settings",/^\/d\/[^\/]+$/,/^\/d\/[^\/]+\/\d*$/];
        function isExcl(){ var p=window.location.pathname; return excl.some(function(r){ return typeof r==="string"?r===p:r.test(p); }); }
        function isUserPage(){ return /^\/u\/[^\/]+/.test(window.location.pathname); }
        function isMobile(){ return window.matchMedia("(max-width:768px)").matches; }
        function isLogged(){ return !!(window.app&&app.session&&app.session.user); }
        function shouldShow(){ if(!isMobile()) return false; return isLogged()?(!isExcl()&&!isUserPage()):!isExcl(); }
        function removeIcon(){ var el=$("custom-notification-icon"); if(el) el.remove(); }
        function createIcon(){
            removeIcon();
            if(!shouldShow()) return;
            var icon=document.createElement("div");
            icon.id="custom-notification-icon";
            icon.style.cssText="position:fixed;top:6px;right:6px;z-index:1000;padding:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;background:transparent";
            if(isLogged()){
                var bell=document.createElement("i"); bell.className="fas fa-bell"; bell.style.cssText="color:var(--header-control-color);font-size:18px";
                var badge=document.createElement("span"); badge.className="notifications-badge";
                badge.style.cssText="position:absolute;top:-1px;right:-3px;background:var(--primary-color);color:#fff;border-radius:20px;padding:3px 6px;font-size:10px;font-weight:700;min-width:16px;text-align:center;line-height:1.3;display:none;pointer-events:none";
                icon.appendChild(bell); icon.appendChild(badge);
                icon.onclick=function(e){ e.preventDefault();e.stopPropagation();goTo("/notifications"); };
                try{ var c=app.session.user.unreadNotificationCount(); if(c>0){badge.style.display="block";badge.textContent=c>99?"99+":c;} }catch(e){}
            } else {
                var info=document.createElement("i"); info.className="fas fa-info"; info.style.cssText="color:var(--header-control-color);font-size:19px";
                icon.appendChild(info);
                icon.onclick=function(e){ e.preventDefault();e.stopPropagation();goTo("/d/149"); };
            }
            document.body.appendChild(icon);
        }
        var forceUpdate=debounce(createIcon,150);
        if(typeof m!=="undefined"&&m.route){ var orig=m.route.set; m.route.set=function(){ var r=orig.apply(this,arguments); setTimeout(forceUpdate,100); return r; }; }
        window.addEventListener("popstate",function(){ setTimeout(forceUpdate,200); });
        window.addEventListener("focus",forceUpdate,{passive:true});
        createIcon();
    }

    function initLogo(){
        if(window.innerWidth>768) return;
        function createLogoEl(){
            if($("custom-logo-container")) return;
            var c=document.createElement("div"); c.id="custom-logo-container";
            c.style.cssText="position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:1001;transition:opacity 0.3s,transform 0.3s;";
            var a=document.createElement("a"); a.href="/all";
            var img=document.createElement("img"); img.src="https://mytaro.com.ua/logo.WebP"; img.alt="Логотип"; img.style.cssText="max-width:170px;height:auto;display:block;";
            a.appendChild(img); c.appendChild(a); document.body.appendChild(c);
        }
        function handleScroll(){
            var logo=$("custom-logo-container");
            var scrubber=document.querySelector(".App-titleControl")||document.querySelector(".PostStreamScrubber");
            var isDisc=document.querySelector(".DiscussionPage");
            if(!isDisc){
                if(logo){logo.style.opacity="1";logo.style.transform="translateX(-50%) translateY(0)";}
                if(scrubber){scrubber.style.opacity="0";scrubber.style.pointerEvents="none";}
                return;
            }
            var st=window.pageYOffset, hero=document.querySelector(".DiscussionHero"), hh=hero?hero.offsetHeight:200;
            if(st<hh){
                if(logo){logo.style.opacity="1";logo.style.transform="translateX(-50%) translateY(0)";}
                if(scrubber){scrubber.style.opacity="0";scrubber.style.pointerEvents="none";scrubber.style.transition="opacity 0.3s";}
            } else {
                if(logo){logo.style.opacity="0";logo.style.transform="translateX(-50%) translateY(-100%)";}
                if(scrubber){scrubber.style.opacity="1";scrubber.style.pointerEvents="auto";scrubber.style.transition="opacity 0.3s";}
            }
        }
        createLogoEl();
        window.addEventListener("scroll",handleScroll,{passive:true});
        handleScroll();
        observe(document.body,debounce(handleScroll,200),0,{childList:true,subtree:true});
        window.addEventListener("resize",function(){ if(window.innerWidth>768){var l=$("custom-logo-container");if(l)l.remove();}else createLogoEl(); });
    }

    function initSwipe(){
        var startY=0,currentY=0,isDragging=false,canClose=false;
        var xStart=null,yStart=null,xDiff=0,isSwiping=false,hasReached=false;
        var SR=200,SL=-140,SI=90;
        function setupDD(){
            document.querySelectorAll(".Dropdown-menu").forEach(function(dd){
                if(dd.dataset.swipeInit) return;
                dd.dataset.swipeInit="1";
                if(!dd.querySelector(".swipe-indicator")){var ind=document.createElement("div");ind.className="swipe-indicator";dd.insertBefore(ind,dd.firstChild);}
                dd.style.borderRadius="23px 23px 0 0";
                dd.addEventListener("touchstart",function(e){startY=currentY=e.touches[0].clientY;isDragging=true;canClose=dd.scrollTop===0;if(canClose)dd.style.transition="none";},{passive:false});
                dd.addEventListener("touchmove",function(e){
                    if(e.target.closest(".Scrubber-scrollbar,.mobile-nav-menu")) return;
                    var d=e.touches[0].clientY-startY;
                    if(d>0&&canClose){e.preventDefault();currentY=startY+d;var p=Math.min(d/150,1),r=Math.max(8,16-p*8);dd.style.transform="translateY("+d+"px)";dd.style.opacity=Math.max(0.3,1-p);dd.style.borderRadius=r+"px "+r+"px 0 0";}
                },{passive:false});
                dd.addEventListener("touchend",function(){
                    if(!isDragging) return;
                    var d=currentY-startY;
                    if(d>80&&canClose){
                        dd.style.transform="translateY(100vh)";dd.style.opacity="0";dd.style.transition="all 0.3s cubic-bezier(0.4,0,0.2,1)";
                        setTimeout(function(){document.body.dispatchEvent(new MouseEvent("click",{bubbles:true}));setTimeout(function(){dd.style.transform="";dd.style.opacity="";dd.style.transition="";dd.style.borderRadius="16px 16px 0 0";},50);},300);
                    } else {dd.style.transform="";dd.style.opacity="";dd.style.borderRadius="16px 16px 0 0";dd.style.transition="all 0.2s ease";setTimeout(function(){dd.style.transition="";},200);}
                    isDragging=false;
                },{passive:true});
            });
        }
        document.addEventListener("touchstart",function(e){ if(e.target.closest(".Dropdown-toggle,.navigation,.modal,.Dropdown-menu,button,textarea,input")) return; xStart=e.touches[0].clientX;yStart=e.touches[0].clientY;isSwiping=true;hasReached=false; },{passive:true});
        document.addEventListener("touchmove",function(e){
            if(!xStart||!isSwiping) return;
            xDiff=e.touches[0].clientX-xStart;var yDiff=e.touches[0].clientY-yStart;
            if(Math.abs(xDiff)<Math.abs(yDiff)||Math.abs(xDiff)<SI) return;
            var cc=document.querySelectorAll(".App-content");
            if(xDiff>0){cc.forEach(function(c){c.style.transform="translateX("+xDiff+"px)";c.style.opacity=1-Math.abs(xDiff)/(2*SR);});if(xDiff>SR){hasReached=true;cc.forEach(function(c){c.classList.add("permanently-swiped");});}}
            else if(xDiff<0&&window.location.pathname==="/"){cc.forEach(function(c){c.style.transform="translateX("+xDiff+"px) rotateY("+xDiff/10+"deg)";c.style.opacity=1-Math.abs(xDiff)/500;});if(Math.abs(xDiff)>Math.abs(SL)){hasReached=true;cc.forEach(function(c){c.classList.add("permanently-swiped");});}}
        },{passive:true});
        document.addEventListener("touchend",function(){
            if(!isSwiping) return;
            var cc=document.querySelectorAll(".App-content");
            if(hasReached){
                if(xDiff>0){var bl=document.querySelector(".Button-label");if(bl)bl.click();setTimeout(function(){cc.forEach(function(c){c.classList.remove("swiped","permanently-swiped");c.style.transform="";c.style.opacity="";});},300);}
                else if(xDiff<0&&window.location.pathname==="/"){cc.forEach(function(c){c.style.transition="transform 0.4s,opacity 0.4s";c.style.transform="translateX(-100%) rotateY(-15deg)";c.style.opacity="0";});if(typeof m!=="undefined"&&m.route)m.route.set("/all");}
            } else {cc.forEach(function(c){c.style.transition="transform 0.3s,opacity 0.3s";c.style.transform="";c.style.opacity="";}); }
            isSwiping=false;xStart=yStart=null;
        },{passive:true});
        observe(document.body,setupDD,150);
        setupDD();
    }

    function expandUserNav(){
        if(window.innerWidth>767) return;
        var up=document.querySelector(".UserPage"); if(!up) return;
        var nd=document.querySelector(".item-nav .Dropdown"); if(!nd) return;
        var menu=nd.querySelector(".Dropdown-menu"); if(!menu) return;
        var cont=document.createElement("div"); cont.style.cssText="display:flex;flex-wrap:wrap;gap:6px;padding:8px 0;justify-content:center;";
        menu.querySelectorAll("a").forEach(function(link){
            if(link.closest(".Dropdown-separator")) return;
            var a=document.createElement("a"); a.href=link.href;
            a.style.cssText="display:inline-flex;align-items:center;gap:4px;padding:6px 12px;border:1px solid #ccc;border-radius:16px;font-size:13px;text-decoration:none;color:var(--code-color);background:var(--hero-bg);cursor:pointer;";
            a.innerHTML=link.innerHTML;
            if(link.parentElement.classList.contains("active")){a.style.color="var(--tag-color)";a.style.borderColor="var(--tag-color)";}
            a.onclick=function(e){ e.preventDefault(); var path=new URL(a.href).pathname; if(typeof m!=="undefined"&&m.route)m.route.set(path); else{window.history.pushState({},"",path);window.dispatchEvent(new PopStateEvent("popstate"));} };
            cont.appendChild(a);
        });
        nd.parentElement.replaceChild(cont,nd);
    }

    function initQuotes(){
        var processed=new WeakSet();
        function process(){
            document.querySelectorAll("blockquote").forEach(function(q){
                if(processed.has(q)) return; processed.add(q);
                if(q.scrollHeight>80){
                    q.classList.add("collapsible");
                    var btn=document.createElement("button"); btn.className="quote-toggle"; btn.textContent="Показати повністю";
                    btn.onclick=function(e){ e.stopPropagation(); btn.textContent=q.classList.toggle("expanded")?"Згорнути":"Показати повністю"; };
                    q.appendChild(btn);
                }
            });
        }
        process();
        observe(document.body,process,150);
    }

    function init(){
        updateNav(); initProfile(); initNotifications(); initLogo(); initSwipe(); expandUserNav(); initQuotes();
        observe(document.body,debounce(expandUserNav,300),0,{childList:true,subtree:true});
        if(typeof app!=="undefined"&&app.session&&app.session.on){
            app.session.on("login",function(){ setTimeout(function(){updateNav();initProfile();},200); });
            app.session.on("logout",function(){ setTimeout(function(){updateNav();initProfile();},200); });
        }
    }

    var checks=0, t=setInterval(function(){
        if(typeof app!=="undefined"&&app.session){ clearInterval(t); init(); }
        if(++checks>50) clearInterval(t);
    },300);

})();
</script>';
        }),

    (new Extend\Frontend('admin'))
        ->css(__DIR__ . '/resources/less/admin.less'),
]; 
