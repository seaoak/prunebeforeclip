(function() {
    'use strict';

    function initialize() {
        let isFailedToCopyToClipboard = false;
        Array.from(document.querySelectorAll('button'))
            .forEach(elem => elem.addEventListener('click', () => {
                if (isFailedToCopyToClipboard) return;
				const elemOfAnchor = elem.parentNode.querySelector('a');
				if (!elemOfAnchor) throw new Error('unexpected HTML structure');
				const url = elemOfAnchor.href;
				if (!/^javascript:/.test(url)) throw new Error('not a bookmarklet');
                navigator.clipboard.writeText(url)
                    .then(() => {}, err => {
                        console.err('can not write to clipboard');
                        console.err(err);
                        isFailedToCopyToClipboard = true;
                    });
            }));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
