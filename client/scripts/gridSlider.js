'use strict';
(function($document) {


    function onTouch(control, callback) {
        control.addEventListener('touchend', function(e) {
            e.preventDefault();
            callback();
        });
        control.addEventListener('click', callback);
    }

    var leftNewLink = $document.querySelector('.news-link.news-link-ltl'),
        rightNewsLink = $document.querySelector('.news-link.news-link-rtl');

    onTouch(rightNewsLink, function() {
        rightNewsLink.classList.add('hidden');
        rightNewsLink.classList.remove('visible');

        leftNewLink.classList.add('visible');
        leftNewLink.classList.remove('hidden');

    });
    onTouch(leftNewLink, function() {
        leftNewLink.classList.add('hidden');
        leftNewLink.classList.remove('visible');

        rightNewsLink.classList.add('visible');
        rightNewsLink.classList.remove('hidden');

    });


})(document);
