<?php

namespace ForumTaro\Theme;

use Flarum\Extend;
use Flarum\Frontend\Document;

return [
    // Extend the forum frontend
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/resources/js/forum.js')
        ->css(__DIR__ . '/resources/less/forum/extension.less')
        ->content(function (Document $document) {
            $document->foot[] = '
            <div class="mobile-profile-container" id="mpc" style="display:none"></div>
            <button class="login-mobile-btn" id="loginBtn" title="Увійти" style="display:none">
                <i class="fas fa-sign-in-alt"></i>
            </button>

            <div class="mobile-nav" id="mn">
                <a href="/tags" data-route="/tags"><i class="fas fa-th-list"></i><span>Категорії</span></a>
                <a href="#" id="nav-private"><i class="fas fa-lock"></i><span id="nav-private-text">Про нас</span></a>
                <a href="/all" data-route="/all"><i class="fas fa-comments"></i><span>Сторінки</span></a>
                <a href="#" id="nav-bookmarks"><i class="fas fa-bookmark"></i><span id="nav-bookmarks-text">Значення</span></a>
                <a href="#" id="nav-following"><i class="fas fa-user-plus"></i><span id="nav-following-text">Реєстрація</span></a>
            </div>';
        }),
    
    (new Extend\Frontend('admin'))
        ->css(__DIR__ . '/resources/less/admin.less'),
];
