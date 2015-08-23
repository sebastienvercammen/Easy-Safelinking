// ==UserScript==
// @name         Easy Safelinking
// @namespace    http://www.sebastienvercammen.be/
// @version      1.1
// @description  Add QoL to safelinking.net
// @author       Sébastien Vercammen
// @match        *://safelinking.net/*
// @grant        GM_xmlhttpRequest
// @downloadURL https://github.com/sebastienvercammen/Easy-Safelinking/raw/master/Easy%20Safelinking.user.js
// @updateURL https://github.com/sebastienvercammen/Easy-Safelinking/raw/master/Easy%20Safelinking.user.js
// ==/UserScript==

(function(w) {
    //w.jQuery || document.write('<script src="http://code.jquery.com/jquery-latest.js"></script>');

    // Only run the following when jQuery is fully loaded
    $(function() {
        $('#captcha').on('keydown', '#adcopy_response', function(e) {
            if(e.keyCode == 13) { // Enter
                $('a[ng-click="validate()"]').click();
            }
        });
        
        // Wait until our links have loaded
        w.easySafelinking = setInterval(function() {
            var links = $('#links-container li a');
            
            // Reset counters
            w.easySafelinkingWorking = 0;
            w.easySafelinkingTotal = 0;

            if(links.length) {
                var html = '<h3>Status: <span id="easySafelinking-status">0/0</span></h3><h3>Worked:</h3><textarea id="easySafelinking-worked" style="width: 100%; min-height: 300px;"></textarea><h3>Failed:</h3><textarea id="easySafelinking-failed" style="width: 100%; min-height: 300px;"></textarea>';
                $('#links-container').html(html);

                for(var i = 0; i < links.length; i++) {
                    w.easySafelinkingTotal++;
                    var l = links[i];
                    
                    GM_xmlhttpRequest({
                        method: "GET",
                        url: window.location.protocol + "//www.alldebrid.com/service.php?" + 'link=' + encodeURIComponent(l) + '&nb=0&json=true&pw=',
                        onload: function(res) {
                            if(res.status == 200 && res.statusText == "OK") {
                                var r;
                                
                                try {
                                    r = JSON.parse(res.response);
                                    
                                    if(r.error == '') {
                                        $('#easySafelinking-worked').text($('#easySafelinking-worked').text() + r.link + "\r\n");
                                        w.easySafelinkingWorking++;
                                    } else {
                                        $('#easySafelinking-failed').text($('#easySafelinking-failed').text() + l + "\r\n");
                                    }
                                } catch (e) {
                                    // An error occured: it's not valid JSON, so something's up (maybe not logged in?)
                                    if(res.response == 'login') {
                                        alert("You're not logged in to alldebrid. Please verify.");
                                    }
                                    
                                    $('#easySafelinking-failed').text($('#easySafelinking-failed').text() + l + "\r\n");
                                }
                            } else {
                                $('#easySafelinking-failed').text($('#easySafelinking-failed').text() + l + "\r\n");
                            }
                            
                            $('#easySafelinking-status').text(w.easySafelinkingWorking + '/' + w.easySafelinkingTotal);
                        },
                        onerror: function(d) {
                            $('#easySafelinking-failed').text($('#easySafelinking-failed').text() + l + "\r\n");
                            $('#easySafelinking-status').text(w.easySafelinkingWorking + '/' + w.easySafelinkingTotal);
                        }
                    });
                }

                clearInterval(w.easySafelinking);
            }
        }, 500);
    });
})(window);