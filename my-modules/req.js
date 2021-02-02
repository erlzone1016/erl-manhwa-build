var searchSites = [
    // 'https://toonily.com/wp-admin/admin-ajax.php',
    'https://www.webtoon.xyz/wp-admin/admin-ajax.php',
    'https://www.mangaclash.com/wp-admin/admin-ajax.php',
    'https://manhwa.club/wp-admin/admin-ajax.php',
    'https://manytoon.com/wp-admin/admin-ajax.php',
    'https://manhwahentai.me/wp-admin/admin-ajax.php',
];

if (window.devMode) {
    (function () {
        // var origin = window.location.origin.replace(/:[0-9]+$/, ':5000');
        var origin = "http://erl-manhwa.herokuapp.com";
        // var origin = "";
        // async function getStoryHTML(url) {

        //     return (await fetch(origin + '/?url=' + encodeURIComponent(url), {
        //         method: "GET"
        //     })).text();
        // }

        // async function getChapterHTML(url) {

        //     return (await fetch(origin + '/?url=' + encodeURIComponent(url), {
        //         method: "GET"
        //     })).text();
        // }

        // async function getImage(url) {

        //     return (await fetch(origin + '/img?url=' + encodeURIComponent(url), {
        //         method: "GET"
        //     })).blob();
        // }



        function getStoryHTML(url) {
            let controller = new AbortController();
            let pr = new Promise(function(resolve, reject) {
                fetch(origin + '/req?url=' + encodeURIComponent(url), {
                    method: "GET",
                    signal: controller.signal
                }).then(function(result) {
                    // console.log("ok", result);
                    if(result.status === 500){
                        reject(result);
                    }else{

                        resolve(result.text());
                    }
                })
                .catch(function(err){
                    console.log("not ok");
                    reject(err);
                });
            });

            pr.getAbortController = function(fn){
                if(typeof fn === 'function') fn(controller);
                return pr;
            }
            return pr; 
        }


        function getChapterHTML(url) {
            return new Promise(function(resolve, reject) {
                fetch(origin + '/req?url=' + encodeURIComponent(url), {
                    method: "GET"
                }).then(function(result) {
                    resolve(result.text());
                })
                .catch(function(err){
                    reject(err);
                });
            });
        }

        function getImage(url) {
            let controller = new AbortController();
            let pr = new Promise(function(resolve, reject) {
                fetch(origin + '/img?url=' + encodeURIComponent(url), {
                    method: "GET",
                    signal: controller.signal
                }).then(function(result) {
                    // console.log("request res:", result);
                    if(result.ok){
                        resolve(result.blob());
                    }else{
                        reject(result);
                    }
                    
                })
                .catch(function(err){
                    console.log("request catch", err);
                    reject(err);
                });
            });

            pr.getAbortController = function(fn){
                if(typeof fn === 'function') fn(controller);
                return pr;
            }

            return pr;
        }



        function searchOnline(keyword){
            return new Promise((resolve, reject) => {
                var _params = new FormData();
                _params.append('action', 'wp-manga-search-manga');
                _params.append('title', keyword);

             
                function searchSite(url){
                    return new Promise((resolve2, reject2) => {
                        fetch(origin + '/search?keyword=' + encodeURIComponent(keyword) + "&url=" + encodeURIComponent(url), {
                            method: "GET"
                        }).then(function(result) {
                            resolve2(result.json());
                        })
                        .catch(function(err){
                            reject2(err);
                        });
                    });
                }


                let results = searchSites.map((url) => {
                    return searchSite(url);
                });

                Promise.all(results)
                .then((values) => {
                    // console.log(values);
                    resolve(values);
                })

            });
        }

        window.erl_export(
            'req', {
                getChapterHTML: getChapterHTML,
                getStoryHTML: getStoryHTML,
                getImage: getImage,
                searchOnline: searchOnline
            }
        )
    })();
} else {

    (function () {
        function getStoryHTML(url) {
            let controller = {};
            let requestId = null;
            controller.abort = function(){
                if(!requestId) return;
                cordova.plugin.http.abort(requestId, function(result){
                    console.log("story aborted: ", result.aborted);
                })
            }

            let pr = new Promise((resolve, reject) => {
                // alert("Executing!");
                const options = {
                    method: 'get',
                    responseType: 'text'
                };
                // return (await fetch('http://localhost:5000/?url=' + encodeURIComponent(url), {method: "GET"})).text();
                requestId = cordova.plugin.http.sendRequest(
                    url,
                    options,
                    function (response) {
                        // prints 200
                        console.log(response.status);
                        resolve(response.data);
                    },
                    function (response) {
                        // prints 403
                        reject(response.error);
                        console.log(response.status);

                        //prints Permission denied
                        console.log(response.error);
                    }
                );
            });
            
            pr.getAbortController = function(fn){
                if(typeof fn === 'function') fn(controller);
                return pr;
            }

            return pr;

        }

        function getChapterHTML(url) {
            return new Promise((resolve, reject) => {
                const options = {
                    method: 'get',
                    responseType: 'text'
                };
                cordova.plugin.http.sendRequest(
                    url,
                    options,
                    function (response) {
                        // prints 200
                        console.log(response.status);
                        resolve(response.data);
                    },
                    function (response) {
                        // prints 403
                        reject(response);
                        console.log(response.status);

                        //prints Permission denied
                        console.log(response.error);
                    }
                );
            });
        }

        function getImage(url) {
            let controller = {};
            let requestId = null;
            controller.abort = function(){
                if(!requestId) return;
                cordova.plugin.http.abort(requestId, function(result){
                    console.log("img aborted: ", result.aborted);
                }, function(response) {
                    console.error(response.error);
                })
            }

            let pr = new Promise((resolve, reject) => {
                const options = {
                    method: 'get',
                    responseType: 'blob'
                };
                requestId = cordova.plugin.http.sendRequest(
                    url,
                    options,
                    function (response) {
                        // prints 200
                        console.log(response.status);
                        response.ok = true;
                        resolve(response.data);
                    },
                    function (response) {
                        // prints 403
                        response.ok = false;
                        reject(response);
                        console.log(response.status);

                        //prints Permission denied
                        console.log(response.error);
                    }
                );

                console.log("requestId: ", requestId);
            });

            pr.getAbortController = function(fn){
                if(typeof fn === 'function') fn(controller);
                return pr;
            }

            return pr;
        }


        /**
         * 
         * @param {string} keyword - search keyword 
         */
        function searchOnline(keyword){
            return new Promise((resolve, reject) => {
                var _params = new FormData();
                _params.append('action', 'wp-manga-search-manga');
                _params.append('title', keyword);

                const options = {
                    method: 'post',
                    responseType: 'json',
                    data: _params
                };


                function searchSite(url){
                    return new Promise((resolve2, reject2) => {
                        cordova.plugin.http.setDataSerializer('multipart');
                        cordova.plugin.http.sendRequest(
                            url,
                            options,
                            function (response) {
                                // prints 200
                                console.log(response.status);
                                resolve2(response.data);
                            },
                            function (response) {
                                // prints 403
                                reject2(response);
                                console.log(response.status);
        
                                //prints Permission denied
                                console.log(response.error);
                            }
                        );
                    });
                }


                let results = searchSites.map((url) => {
                    return searchSite(url);
                });


                Promise.all(results)
                .then((values) => {
                    // console.log(values);
                    resolve(values);
                })

            });
        }

        window.erl_export(
            'req', {
                getChapterHTML: getChapterHTML,
                getStoryHTML: getStoryHTML,
                getImage: getImage,
                searchOnline: searchOnline
            }
        )
    })();
}