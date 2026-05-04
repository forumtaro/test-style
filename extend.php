<?php

namespace ForumTaro\Theme;

use Flarum\Extend;
use Flarum\Frontend\Document;

return [
    (new Extend\Frontend('forum'))
        ->css(__DIR__ . '/resources/less/forum/extension.less')
        ->content(function (Document $document) {
            // Можна додати мета-дані, шрифти тощо
        }),
    
    (new Extend\Frontend('admin'))
        ->css(__DIR__ . '/resources/less/admin.less'),
    
    // Реєстрація асетів
    new Extend\Locales(__DIR__ . '/resources/locale'),
];
