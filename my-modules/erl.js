window.erlModules = {};
window.erl_export = function(key, value){
    window.erlModules[key] = value;
};
window.erl_require = function(key){
    return window.erlModules[key];
};

//CACHE LOADING IMAGE
(function(){
    var loading = new Image();
    loading.src = './loading.svg';
})();